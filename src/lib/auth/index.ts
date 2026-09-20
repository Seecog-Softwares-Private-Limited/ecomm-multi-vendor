export { authConfig, type AuthRole } from "./config";
export { hashPassword, verifyPassword } from "./password";
export { signToken, verifyToken, type JwtPayload } from "./jwt";
export { setAuthCookie, clearAuthCookie, getTokenFromCookie } from "./cookies";
export {
  verifyAppleIdentityToken,
  sha256Hex,
  isApplePrivateRelayEmail,
  AppleAuthError,
  APPLE_ISSUER,
  VENDOR_IOS_BUNDLE_ID,
  resolveAppleVendorMatch,
  type AppleIdentityClaims,
  type AppleVendorMatch,
} from "./apple";
export {
  verifyGoogleIdToken,
  isGoogleIdTokenAuthConfigured,
  getGoogleIdTokenAudiences,
  GoogleAuthError,
  GOOGLE_ISSUERS,
  type GoogleIdentityClaims,
} from "./google-id-token";
export {
  completeCustomerSocialLogin,
  type CustomerSocialProfile,
  type CompleteCustomerSocialResult,
} from "./complete-customer-google";
export {
  linkGoogleToVendorSeller,
  VendorGoogleLinkError,
  VENDOR_GOOGLE_EMAIL_EXISTS_MESSAGE,
  GOOGLE_IDENTITY_ALREADY_LINKED_MESSAGE,
} from "./link-vendor-google";
export {
  registerSchema,
  registerPasswordOnlySchema,
  loginSchema,
  vendorRegisterSchema,
  validateRegister,
  validateLogin,
  validateVendorRegister,
  validatePhoneOtpSend,
  validatePhoneOtpVerify,
  validateCustomerOnboardingProfile,
  formatValidationDetails,
  type RegisterInput,
  type LoginInput,
  type VendorRegisterInput,
  type PhoneOtpSendInput,
  type PhoneOtpVerifyInput,
  type CustomerOnboardingProfileInput,
  type ValidationResult,
  type ValidationError,
} from "./validation";
export {
  computeAuthOnboardingComplete,
  syncCustomerAuthOnboardingComplete,
  customerAuthStatusFields,
  customerHasName,
  customerHasRealEmail,
  CUSTOMER_ONBOARDING_SELECT,
} from "./customer-onboarding";
export {
  normalizeIndianPhone,
  placeholderEmailForPhoneNorm,
  syntheticEmailForPhoneNorm,
  isPlaceholderCustomerEmail,
  INDIAN_MOBILE_HINT,
} from "./phone";
export {
  completePhoneFirstOnboarding,
  EMAIL_ALREADY_REGISTERED_MESSAGE,
} from "./complete-phone-onboarding";
export { getSession, requireSession } from "./session";
export {
  assertCustomerAuthComplete,
  requireCompleteCustomerSession,
  ACCOUNT_INCOMPLETE_MESSAGE,
} from "./assert-customer-auth-complete";
export {
  requireVendorApproved,
  getVendorStatus,
  toVendorStatusDisplay,
  type VendorStatusDisplay,
} from "./vendor-approval";
export {
  assertSellerAuthComplete,
  SELLER_ACCOUNT_INCOMPLETE_MESSAGE,
} from "./assert-seller-auth-complete";
export {
  computeSellerAuthOnboardingComplete,
  syncSellerAuthOnboardingComplete,
  sellerAuthStatusFields,
  isPlaceholderVendorEmail,
  placeholderEmailForVendorPhoneNorm,
  findActiveSellerByPhoneNorm,
} from "./seller-onboarding";
export { getVerifiedSession } from "./middleware-auth";
export {
  isAuthPage,
  isSellerRoute,
  isAdminRoute,
  isAuthRequiredPath,
  isVendorLoginPage,
  isCustomerOnboardingPage,
  isVendorAuthOnboardingPage,
  requiresAuth,
  AUTH_REQUIRED_PATHS,
  CUSTOMER_ONBOARDING_PATH,
  CUSTOMER_ONBOARDING_PAGES,
  VENDOR_AUTH_ONBOARDING_PATH,
  VENDOR_AUTH_ONBOARDING_PAGES,
  SELLER_PREFIX,
  ADMIN_PREFIX,
  SELLER_LOGIN,
  VENDOR_LOGIN,
  ADMIN_LOGIN,
} from "./middleware-routes";
