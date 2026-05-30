export { getSmsService, smsService, SmsService } from "./sms.module";
export { buildSmsMessage } from "./sms.templates";
export type { SmsTemplateKey, TemplateVars } from "./sms.templates";
export { deliverCustomerLoginOtp } from "./otp-delivery";
export { getSmsProvider, getFast2SmsEnv, getAdminAlertPhones } from "./sms.config";
