/**
 * SMS notification service — inject this from API routes after successful operations.
 * Failures are logged only; main business flow is never blocked.
 */

import { getSmsService } from "@/sms/sms.module";

export class SmsNotificationService {
  private get sms() {
    return getSmsService();
  }

  onCustomerRegistration(payload: { name?: string; phone?: string | null }) {
    this.sms.notifyCustomerRegistrationAdmin({
      name: [payload.name].filter(Boolean).join(" ") || "Customer",
      phone: payload.phone ?? undefined,
    });
  }

  onCustomerOrder(payload: { orderId: string; amount?: number }) {
    this.sms.notifyCustomerOrderAdmin(payload);
  }

  onVendorRegistration(payload: { businessName: string }) {
    this.sms.notifyVendorRegistrationAdmin(payload);
  }

  onVendorApproval(payload: { phone: string | null | undefined; name: string }) {
    if (payload.phone?.trim()) {
      this.sms.sendVendorApproval(payload.phone, payload.name);
    }
  }

  onVendorAddProduct(payload: { productName: string; vendorName: string }) {
    this.sms.notifyVendorAddProductAdmin(payload);
  }

  onVendorOrderAccept(payload: { orderId: string; vendorName: string }) {
    this.sms.notifyVendorOrderAcceptAdmin(payload);
  }

  onProductApproval(payload: { phone: string | null | undefined; productName: string }) {
    if (payload.phone?.trim()) {
      this.sms.sendProductApproval(payload.phone, payload.productName);
    }
  }

  onPaymentSettlement(payload: {
    phone: string | null | undefined;
    amount: number;
    period?: string;
  }) {
    if (payload.phone?.trim()) {
      this.sms.sendPaymentSettlement(payload.phone, payload.amount, payload.period);
    }
  }

  onPaymentReceived(payload: { phone: string | null | undefined; amount: number }) {
    if (payload.phone?.trim()) {
      this.sms.sendPaymentReceived(payload.phone, payload.amount);
    }
  }
}

let smsNotificationService: SmsNotificationService | null = null;

export function getSmsNotificationService(): SmsNotificationService {
  if (!smsNotificationService) {
    smsNotificationService = new SmsNotificationService();
  }
  return smsNotificationService;
}
