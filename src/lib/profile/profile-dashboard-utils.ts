type ProfileUser = {
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
};

export function getProfileDisplayName(user: ProfileUser | null): string {
  if (!user) return "Guest";
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(" ");
  }
  return user.email.split("@")[0] ?? "User";
}

export function getProfileInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (parts[0]?.slice(0, 2) ?? "U").toUpperCase();
}

export function formatProfileCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const APP_VERSION = "0.0.1";
