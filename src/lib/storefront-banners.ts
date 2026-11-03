export type StorefrontBanner = {
  id: string;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  ctaText: string | null;
  linkUrl: string;
};

/** Active banners for a placement; empty on any failure so the caller falls back to its defaults. */
export async function fetchActiveBanners(placement: "HERO" | "PROMO"): Promise<StorefrontBanner[]> {
  try {
    const res = await fetch(`/api/banners?placement=${placement}`);
    const json = await res.json();
    return res.ok && Array.isArray(json?.data) ? (json.data as StorefrontBanner[]) : [];
  } catch {
    return [];
  }
}
