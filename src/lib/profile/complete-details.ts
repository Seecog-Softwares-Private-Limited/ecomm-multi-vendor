import { prisma } from "@/lib/prisma";
import { normalizeIndianPhone, INDIAN_MOBILE_HINT } from "@/lib/auth/phone";

export type CompleteProfileDetailsInput = {
  phone: string;
  firstName?: string;
  lastName?: string;
  /** When true, only the mobile number is saved; name fields are ignored. */
  skipOptional?: boolean;
};

export async function completeProfileDetails(
  userId: string,
  input: CompleteProfileDetailsInput
): Promise<{ error: string | null }> {
  const phoneNorm = normalizeIndianPhone(input.phone);
  if (!phoneNorm) return { error: INDIAN_MOBILE_HINT };

  const taken = await prisma.user.findFirst({
    where: { phone: phoneNorm, deletedAt: null, id: { not: userId } },
    select: { id: true },
  });
  if (taken) return { error: "This mobile number is already used by another account." };

  const data: {
    phone: string;
    profileCompleted: boolean;
    firstName?: string | null;
    lastName?: string | null;
  } = {
    phone: phoneNorm,
    profileCompleted: true,
  };

  if (!input.skipOptional) {
    if (input.firstName !== undefined) {
      data.firstName = input.firstName.trim() || null;
    }
    if (input.lastName !== undefined) {
      data.lastName = input.lastName.trim() || null;
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data,
  });

  return { error: null };
}
