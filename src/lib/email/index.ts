export { emailConfig } from "./config";
export { sendMail, type SendMailOptions } from "./send";
export { sendVendorVerificationEmail } from "./vendor-verification";
export { sendCustomerVerificationEmail } from "./customer-verification";
export { sendCustomerEmailOtpEmail } from "./customer-email-otp";
export { sendVendorPasswordResetEmail } from "./vendor-password-reset";
export { sendCustomerPasswordResetEmail } from "./customer-password-reset";
export {
  sendAdminPasswordResetEmail,
  type AdminPasswordResetPortal,
} from "./admin-password-reset";
export {
  sendGoogleOAuthWelcomeEmail,
  queueGoogleOAuthWelcomeEmail,
  type GoogleOAuthWelcomeEmailParams,
} from "./oauth-google-welcome";
