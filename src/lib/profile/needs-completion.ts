/** Customer must add a mobile number before using the app fully. */
export function userNeedsProfileCompletion(user: {
  phone: string | null;
  profileCompleted: boolean;
}): boolean {
  if (!user.phone?.trim()) return true;
  return !user.profileCompleted;
}
