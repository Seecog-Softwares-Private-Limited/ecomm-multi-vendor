/**
 * IndoVyapar SMS service — BlackSMS (primary).
 * All outbound SMS goes through this class only.
 */

import { normalizeIndianPhone, toIndianMobile10Digits } from "@/lib/auth/phone";
import { buildSmsMessage, type SmsTemplateKey, type TemplateVars } from "@/sms/sms.templates";
import { getAdminAlertPhones, getSmsProvider } from "@/sms/sms.config";
import { sendBlackSmsOtp, sendBlackSmsTransactional } from "@/sms/blacksms.client";
import { prisma } from "@/lib/prisma";

export type SmsResult = { success: true } | { success: false; error: string };

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

  async sendOtp(phone: string, otp: string): Promise<SmsResult> {
    const mobile10 = this.normalizeMobile(phone);
    if (!mobile10) return { success: false, error: "Invalid Indian mobile number" };
    return sendBlackSmsOtp(mobile10, otp);
  }

  async sendTransactional(phone: string, message: string): Promise<SmsResult> {
    const mobile10 = this.normalizeMobile(phone);
    if (!mobile10) return { success: false, error: "Invalid Indian mobile number" };
    const text = message.replace(/\s+/g, " ").trim().slice(0, 160);
    if (!text) return { success: false, error: "Message is empty" };
    return sendBlackSmsTransactional(mobile10, text);
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
}
