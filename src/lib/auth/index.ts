export { authConfig, type AuthRole } from "./config";
export { hashPassword, verifyPassword } from "./password";
export { signToken, verifyToken, type JwtPayload } from "./jwt";
export { setAuthCookie, clearAuthCookie, getTokenFromCookie } from "./cookies";
export {
  registerSchema,
  loginSchema,
  vendorRegisterSchema,
  validateRegister,
  validateLogin,
  validateVendorRegister,
  formatValidationDetails,
  type RegisterInput,
  type LoginInput,
  type VendorRegisterInput,
  type ValidationResult,
  type ValidationError,
} from "./validation";
export { getSession, requireSession } from "./session";
export {
  requireVendorApproved,
  getVendorStatus,
  toVendorStatusDisplay,
  type VendorStatusDisplay,
} from "./vendor-approval";
export { getVerifiedSession } from "./middleware-auth";
export {
  isAuthPage,
  isSellerRoute,
  isAdminRoute,
  isAuthRequiredPath,
  isVendorLoginPage,
  requiresAuth,
  AUTH_REQUIRED_PATHS,
  SELLER_PREFIX,
  ADMIN_PREFIX,
  SELLER_LOGIN,
  VENDOR_LOGIN,
  ADMIN_LOGIN,
} from "./middleware-routes";
