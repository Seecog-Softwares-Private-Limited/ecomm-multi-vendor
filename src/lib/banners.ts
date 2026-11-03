import type { BannerPlacement } from "@prisma/client";

const PLACEMENTS: BannerPlacement[] = ["HERO", "PROMO"];

export function parseBannerPlacement(value: unknown): BannerPlacement | null {
  return PLACEMENTS.includes(value as BannerPlacement) ? (value as BannerPlacement) : null;
}

/** Site-relative path or http(s) URL only, so a banner can never carry e.g. a javascript: link. */
export function isSafeBannerUrl(value: string): boolean {
  if (value.startsWith("/")) return !value.startsWith("//");
  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

function optionalText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  return value.trim().slice(0, max) || null;
}

export type BannerInput = {
  placement: BannerPlacement;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  ctaText: string | null;
  linkUrl: string;
  sortOrder: number;
  isActive: boolean;
};

/** Validate an admin banner body; returns the clean fields or an error message. */
export function parseBannerInput(body: unknown): BannerInput | string {
  if (!body || typeof body !== "object") return "Body must be an object";
  const b = body as Record<string, unknown>;

  const placement = parseBannerPlacement(b.placement);
  if (!placement) return "Choose where the banner should appear";

  const imageUrl = typeof b.imageUrl === "string" ? b.imageUrl.trim() : "";
  if (!imageUrl) return "Banner image is required";
  if (!isSafeBannerUrl(imageUrl)) return "Banner image URL is not valid";

  const linkUrl = typeof b.linkUrl === "string" ? b.linkUrl.trim() : "";
  if (!linkUrl) return "Link is required";
  if (!isSafeBannerUrl(linkUrl)) {
    return "Link must start with / (e.g. /category/footwear) or https://";
  }

  const sortOrder = Number(b.sortOrder ?? 0);
  return {
    placement,
    imageUrl,
    linkUrl,
    title: optionalText(b.title, 120),
    subtitle: optionalText(b.subtitle, 255),
    ctaText: optionalText(b.ctaText, 40),
    sortOrder: Number.isFinite(sortOrder) ? Math.trunc(sortOrder) : 0,
    isActive: b.isActive !== false,
  };
}
