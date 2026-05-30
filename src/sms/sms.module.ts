/**
 * Global SMS module (singleton) — import `getSmsService()` anywhere on the server.
 * Next.js equivalent of a NestJS global SmsModule.
 */

import { SmsService } from "@/sms/sms.service";

let instance: SmsService | null = null;

/** Returns the shared SmsService instance. */
export function getSmsService(): SmsService {
  if (!instance) {
    instance = new SmsService();
  }
  return instance;
}

/** Shorthand for event notifications (non-blocking). */
export const smsService = {
  get instance() {
    return getSmsService();
  },
};

export { SmsService } from "@/sms/sms.service";
export { buildSmsMessage } from "@/sms/sms.templates";
export type { SmsTemplateKey, TemplateVars } from "@/sms/sms.templates";
