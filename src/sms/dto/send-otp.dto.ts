import { z } from "zod";

export const sendOtpDtoSchema = z.object({
  phone: z.string().min(10, "Phone number is required"),
  resend: z.boolean().optional(),
});

export type SendOtpDto = z.infer<typeof sendOtpDtoSchema>;
