import { z } from "zod";

const email = z.string().email("Invalid email").max(255).toLowerCase().trim();
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one number");

/** Body for POST /api/auth/register — email/password path requires name + phone.
 * Exported as a plain ZodObject so clients can `.pick({ password: true })`.
 */
export const registerSchema = z.object({
  email,
  password,
  firstName: z.string().max(100).trim().optional(),
  lastName: z.string().max(100).trim().optional(),
  /** Full name from clients that send a single `name` field. */
  name: z.string().max(200).trim().optional(),
  phone: z.string().min(10, "Mobile number is required").max(20).trim(),
});

/** Password-only parse for reset-password. */
export const registerPasswordOnlySchema = registerSchema.pick({ password: true });

const registerParsedSchema = registerSchema
  .superRefine((data, ctx) => {
    const first = data.firstName?.trim() ?? "";
    const last = data.lastName?.trim() ?? "";
    const fullName = data.name?.trim() ?? "";
    if (!first && !last && !fullName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Name is required",
        path: ["firstName"],
      });
    }
  })
  .transform((data) => {
    let firstName = data.firstName?.trim() || "";
    let lastName = data.lastName?.trim() || "";
    const fullName = data.name?.trim() || "";
    if (!firstName && !lastName && fullName) {
      const parts = fullName.split(/\s+/).filter(Boolean);
      firstName = parts[0] ?? "";
      lastName = parts.slice(1).join(" ");
    }
    return {
      email: data.email,
      password: data.password,
      firstName: firstName || null,
      lastName: lastName || null,
      phone: data.phone.trim(),
    };
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
  phone: z.string().min(10, "Mobile number is required").max(20).trim(),
  phoneProofToken: z.string().min(10, "Verify your phone with OTP first"),
});

export type RegisterInput = z.infer<typeof registerParsedSchema>;
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
  const result = registerParsedSchema.safeParse(body);
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

/** Body for POST /api/auth/phone-otp/send (optional `resend` for UX / logging after OTP step). */
export const phoneOtpSendSchema = z.object({
  phone: z.string().min(10, "Enter a valid mobile number").max(32).trim(),
  resend: z.boolean().optional(),
});

/** Body for POST /api/auth/phone-otp/verify — accepts `otp` or legacy `code`. */
export const phoneOtpVerifySchema = z
  .object({
    phone: z.string().min(10, "Enter a valid mobile number").max(32).trim(),
    code: z
      .string()
      .regex(/^\d{4,9}$/, "Enter the OTP you received")
      .optional(),
    otp: z
      .string()
      .regex(/^\d{4,9}$/, "Enter the OTP you received")
      .optional(),
  })
  .refine((d) => Boolean(d.code?.trim() || d.otp?.trim()), {
    message: "OTP is required",
    path: ["otp"],
  })
  .transform((d) => ({
    phone: d.phone,
    code: (d.otp ?? d.code ?? "").trim(),
  }));

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

/** Body for POST /api/auth/onboarding/profile — phone-first name + real email. */
export const customerOnboardingProfileSchema = z
  .object({
    email,
    firstName: z.string().max(100).trim().optional(),
    lastName: z.string().max(100).trim().optional(),
    name: z.string().max(200).trim().optional(),
  })
  .superRefine((data, ctx) => {
    const first = data.firstName?.trim() ?? "";
    const last = data.lastName?.trim() ?? "";
    const fullName = data.name?.trim() ?? "";
    if (!first && !last && !fullName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Name is required",
        path: ["name"],
      });
    }
  })
  .transform((data) => {
    let firstName = data.firstName?.trim() || "";
    let lastName = data.lastName?.trim() || "";
    const fullName = data.name?.trim() || "";
    if (!firstName && !lastName && fullName) {
      const parts = fullName.split(/\s+/).filter(Boolean);
      firstName = parts[0] ?? "";
      lastName = parts.slice(1).join(" ");
    }
    return {
      email: data.email,
      firstName: firstName || null,
      lastName: lastName || null,
    };
  });

export type CustomerOnboardingProfileInput = z.infer<typeof customerOnboardingProfileSchema>;

export function validateCustomerOnboardingProfile(
  body: unknown
): ValidationResult<CustomerOnboardingProfileInput> | ValidationError {
  const result = customerOnboardingProfileSchema.safeParse(body);
  if (result.success) return { success: true, data: result.data };
  return { success: false, errors: result.error.issues };
}

/** Format Zod issues for API error details. Re-exported from shared validation. */
export { formatValidationDetails } from "@/lib/validation";
