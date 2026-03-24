import { z } from "zod";

const email = z.string().email("Invalid email").max(255).toLowerCase().trim();
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one number");

/** Body for POST /api/auth/register */
export const registerSchema = z.object({
  email,
  password,
  firstName: z.string().max(100).trim().optional(),
  lastName: z.string().max(100).trim().optional(),
  phone: z.string().max(20).trim().optional(),
});

/** Body for POST /api/auth/login */
export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

/** Body for POST /api/auth/vendor-register */
export const vendorRegisterSchema = z.object({
  email,
  password,
  businessName: z.string().min(1, "Business name is required").max(255).trim(),
  ownerName: z.string().min(1, "Owner name is required").max(255).trim(),
  phone: z.string().max(20).trim().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VendorRegisterInput = z.infer<typeof vendorRegisterSchema>;

export interface ValidationResult<T> {
  success: true;
  data: T;
}

export interface ValidationError {
  success: false;
  errors: z.ZodIssue[];
}

export function validateRegister(
  body: unknown
): ValidationResult<RegisterInput> | ValidationError {
  const result = registerSchema.safeParse(body);
  if (result.success) return { success: true, data: result.data };
  return { success: false, errors: result.error.issues };
}

export function validateLogin(body: unknown): ValidationResult<LoginInput> | ValidationError {
  const result = loginSchema.safeParse(body);
  if (result.success) return { success: true, data: result.data };
  return { success: false, errors: result.error.issues };
}

export function validateVendorRegister(
  body: unknown
): ValidationResult<VendorRegisterInput> | ValidationError {
  const result = vendorRegisterSchema.safeParse(body);
  if (result.success) return { success: true, data: result.data };
  return { success: false, errors: result.error.issues };
}

/** Body for POST /api/auth/phone-otp/send */
export const phoneOtpSendSchema = z.object({
  phone: z.string().min(10, "Enter a valid mobile number").max(32).trim(),
});

/** Body for POST /api/auth/phone-otp/verify */
export const phoneOtpVerifySchema = z.object({
  phone: z.string().min(10, "Enter a valid mobile number").max(32).trim(),
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit OTP"),
});

export type PhoneOtpSendInput = z.infer<typeof phoneOtpSendSchema>;
export type PhoneOtpVerifyInput = z.infer<typeof phoneOtpVerifySchema>;

export function validatePhoneOtpSend(
  body: unknown
): ValidationResult<PhoneOtpSendInput> | ValidationError {
  const result = phoneOtpSendSchema.safeParse(body);
  if (result.success) return { success: true, data: result.data };
  return { success: false, errors: result.error.issues };
}

export function validatePhoneOtpVerify(
  body: unknown
): ValidationResult<PhoneOtpVerifyInput> | ValidationError {
  const result = phoneOtpVerifySchema.safeParse(body);
  if (result.success) return { success: true, data: result.data };
  return { success: false, errors: result.error.issues };
}

/** Format Zod issues for API error details. Re-exported from shared validation. */
export { formatValidationDetails } from "@/lib/validation";
