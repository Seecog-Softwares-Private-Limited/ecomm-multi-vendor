/**
 * IndoVyapar SMS service — Fast2SMS (primary), with safe fallbacks.
 * All outbound SMS goes through this class only.
 */

import axios, { isAxiosError } from "axios";
import { normalizeIndianPhone, toIndianMobile10Digits } from "@/lib/auth/phone";
import { buildSmsMessage, type SmsTemplateKey, type TemplateVars } from "@/sms/sms.templates";
import { getAdminAlertPhones, getFast2SmsEnv, getSmsProvider } from "@/sms/sms.config";
import { prisma } from "@/lib/prisma";

const REQUEST_TIMEOUT_MS = 25_000;
const MAX_RETRIES = 1;

export type SmsResult = { success: true } | { success: false; error: string };

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function isFast2SmsOk(data: unknown, status: number): boolean {
  if (status < 200 || status >= 300) return false;
  if (data == null) return true;
  if (typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (o.return === true) return true;
    if (o.return === false) return false;
    const code = o.status_code;
    if (code === 200 || code === "200") return true;
  }
  return status >= 200 && status < 300;
}

function failureFromBody(data: unknown, status: number): string {
  if (data != null && typeof data === "object" && "message" in data) {
    const m = (data as { message: unknown }).message;
    if (typeof m === "string" && m) return m;
    if (Array.isArray(m) && m[0]) return String(m[0]);
  }
  return `SMS failed (HTTP ${status})`;
}

export class SmsService {
  private normalizeMobile(phone: string): string | null {
    const norm = normalizeIndianPhone(phone.trim());
    if (!norm) return null;
    const mobile10 = toIndianMobile10Digits(norm);
    return /^[6-9]\d{9}$/.test(mobile10) ? mobile10 : null;
  }

  isConfigured(): boolean {
    return getSmsProvider() !== "none";
  }

  /**
   * OTP SMS — Quick SMS by default (no DLT). Set FAST2SMS_OTP_ROUTE=otp only after DLT approval.
   */
  async sendOtp(phone: string, otp: string): Promise<SmsResult> {
    const cfg = getFast2SmsEnv();
    if (!cfg) {
      return { success: false, error: "FAST2SMS_API_KEY is not set" };
    }
    const mobile10 = this.normalizeMobile(phone);
    if (!mobile10) return { success: false, error: "Invalid Indian mobile number" };
    if (!/^\d{4,10}$/.test(otp)) return { success: false, error: "Invalid OTP format" };

    if (cfg.otpRoute === "otp") {
      const url = `${cfg.baseUrl}${cfg.bulkPath}`;
      const body: Record<string, string> = {
        route: "otp",
        variables_values: otp,
        numbers: mobile10,
      };
      return this.postFast2Sms(url, cfg.apiKey, body, "sendOtp");
    }

    return this.sendTransactional(
      phone,
      buildSmsMessage("customer_otp", { otp, minutes: 5 })
    );
  }

  /**
   * Alerts & notifications — Quick SMS (`route: q`) by default, no DLT required.
   */
  async sendTransactional(phone: string, message: string): Promise<SmsResult> {
    const cfg = getFast2SmsEnv();
    if (!cfg) {
      return { success: false, error: "FAST2SMS_API_KEY is not set" };
    }
    const mobile10 = this.normalizeMobile(phone);
    if (!mobile10) return { success: false, error: "Invalid Indian mobile number" };

    const text = message.replace(/\s+/g, " ").trim().slice(0, 480);
    if (!text) return { success: false, error: "Message is empty" };

    const url = `${cfg.baseUrl}${cfg.bulkPath}`;
    const route = cfg.bulkRoute;

    const body: Record<string, string> = {
      route,
      message: text,
      language: "english",
      flash: "0",
      numbers: mobile10,
    };

    if (route === "dlt") {
      body.sender_id = cfg.senderId;
    } else if (route === "d" && cfg.senderId) {
      body.sender_id = cfg.senderId;
    }

    return this.postFast2Sms(url, cfg.apiKey, body, "sendTransactional");
  }

  async sendTemplate(
    phone: string,
    templateKey: SmsTemplateKey,
    vars: TemplateVars = {}
  ): Promise<SmsResult> {
    return this.sendTransactional(phone, buildSmsMessage(templateKey, vars));
  }

  /** Fire-and-forget — never throws; logs failures only. */
  sendTemplateAsync(
    phone: string | null | undefined,
    templateKey: SmsTemplateKey,
    vars: TemplateVars,
    logContext: string
  ): void {
    if (!phone?.trim()) {
      console.warn(`[SmsService] Skipped ${logContext} — no phone`);
      return;
    }
    void this.sendTemplate(phone, templateKey, vars).then((r) => {
      const tail = phone.replace(/\D/g, "").slice(-4);
      if (r.success) {
        console.info(`[SmsService] OK ${logContext} ***${tail}`);
      } else {
        console.error(`[SmsService] FAIL ${logContext} ***${tail}:`, r.error);
      }
    });
  }

  async sendToAdmins(templateKey: SmsTemplateKey, vars: TemplateVars): Promise<void> {
    const phones = await this.resolveAdminPhones();
    for (const p of phones) {
      this.sendTemplateAsync(p, templateKey, vars, `admin:${templateKey}`);
    }
  }

  async resolveAdminPhones(): Promise<string[]> {
    const fromEnv = getAdminAlertPhones();
    if (fromEnv.length > 0) return fromEnv;

    const admins = await prisma.admin.findMany({
      where: { phone: { not: null }, deletedAt: null },
      select: { phone: true },
      take: 10,
    });
    return admins.map((a) => a.phone).filter((p): p is string => Boolean(p?.trim()));
  }

  // ——— Event helpers (table from product spec) ———

  notifyCustomerRegistrationAdmin(vars: { name?: string; phone?: string }): void {
    void this.sendToAdmins("customer_registration_admin", vars);
  }

  notifyCustomerOrderAdmin(vars: { orderId: string; amount?: number }): void {
    void this.sendToAdmins("customer_order_admin", vars);
  }

  notifyVendorRegistrationAdmin(vars: { businessName: string }): void {
    void this.sendToAdmins("vendor_registration_admin", vars);
  }

  sendVendorApproval(phone: string, name: string): void {
    this.sendTemplateAsync(phone, "vendor_approval_vendor", { name }, "vendor_approval");
  }

  notifyVendorAddProductAdmin(vars: { productName: string; vendorName: string }): void {
    void this.sendToAdmins("vendor_add_product_admin", vars);
  }

  notifyVendorOrderAcceptAdmin(vars: { orderId: string; vendorName: string }): void {
    void this.sendToAdmins("vendor_order_accept_admin", vars);
  }

  sendProductApproval(phone: string, productName: string): void {
    this.sendTemplateAsync(phone, "product_approval_vendor", { productName }, "product_approval");
  }

  sendPaymentSettlement(phone: string, amount: number, period?: string): void {
    this.sendTemplateAsync(phone, "payment_settlement_vendor", { amount, period }, "payment_settlement");
  }

  sendPaymentReceived(phone: string, amount: number): void {
    this.sendTemplateAsync(phone, "payment_received_vendor", { amount }, "payment_received");
  }

  private async postFast2Sms(
    url: string,
    apiKey: string,
    body: Record<string, string>,
    context: string
  ): Promise<SmsResult> {
    let lastError = "Fast2SMS request failed";

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const { data, status } = await axios.post<unknown>(url, body, {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            authorization: apiKey,
          },
          timeout: REQUEST_TIMEOUT_MS,
          validateStatus: (s) => s >= 200 && s < 500,
        });

        if (isFast2SmsOk(data, status)) return { success: true };
        lastError = failureFromBody(data, status);
        console.error(`[SmsService ${context}]`, { status, data });
        break;
      } catch (e) {
        lastError = isAxiosError(e)
          ? String((e.response?.data as { message?: string })?.message ?? e.message)
          : e instanceof Error
            ? e.message
            : String(e);
        console.error(`[SmsService ${context}]`, lastError);
        if (attempt < MAX_RETRIES) {
          await sleep(800);
          continue;
        }
      }
    }

    return { success: false, error: lastError };
  }
}
