import { z } from "zod";

export const verifyOtpDtoSchema = z.object({
  phone: z.string().min(10, "Phone number is required"),
  otp: z.string().min(4).max(9).optional(),
  code: z.string().min(4).max(9).optional(),
});

export type VerifyOtpDto = z.infer<typeof verifyOtpDtoSchema>;
