/** Single source of truth for footer CMS sections and slugs (admin + storefront). */

export type CmsFooterSectionId =
  | "about-us"
  | "sell-with-us"
  | "customer-support"
  | "policies";

export type CmsFooterPageDef = {
  slug: string;
  label: string;
};

export type CmsFooterSectionDef = {
  id: CmsFooterSectionId;
  title: string;
  pages: CmsFooterPageDef[];
};

export const CMS_FOOTER_SECTIONS: CmsFooterSectionDef[] = [
  {
    id: "about-us",
    title: "About Us",
    pages: [
      { slug: "about-indovyapar", label: "About Indovyapar" },
      { slug: "careers", label: "Careers" },
      { slug: "press", label: "Press" },
      { slug: "corporate-information", label: "Corporate Information" },
    ],
  },
  {
    id: "sell-with-us",
    title: "Sell With Us",
    pages: [
      { slug: "sell-on-indovyapar", label: "Sell on Indovyapar" },
      { slug: "become-a-supplier", label: "Become a Supplier" },
      { slug: "advertise-your-products", label: "Advertise Your Products" },
      { slug: "partner-programs", label: "Partner Programs" },
    ],
  },
  {
    id: "customer-support",
    title: "Customer Support",
    pages: [
      { slug: "help-center", label: "Help Center" },
      { slug: "track-your-order", label: "Track Your Order" },
      { slug: "returns-refunds", label: "Returns & Refunds" },
      { slug: "contact-us", label: "Contact Us" },
    ],
  },
  {
    id: "policies",
    title: "Policies",
    pages: [
      { slug: "privacy-policy", label: "Privacy Policy" },
      { slug: "terms-of-service", label: "Terms of Service" },
      { slug: "shipping-policy", label: "Shipping Policy" },
      { slug: "cancellation-policy", label: "Cancellation Policy" },
    ],
  },
];

const SLUG_SET = new Set(
  CMS_FOOTER_SECTIONS.flatMap((s) => s.pages.map((p) => p.slug))
);

const SLUG_TO_META = new Map<
  string,
  { sectionId: CmsFooterSectionId; label: string }
>();
for (const section of CMS_FOOTER_SECTIONS) {
  for (const p of section.pages) {
    SLUG_TO_META.set(p.slug, { sectionId: section.id, label: p.label });
  }
}

export function isValidCmsFooterSlug(slug: string): boolean {
  return SLUG_SET.has(slug);
}

export function getCmsFooterPageMeta(slug: string): {
  sectionId: CmsFooterSectionId;
  label: string;
} | null {
  return SLUG_TO_META.get(slug) ?? null;
}

export function getCmsFooterSection(id: string): CmsFooterSectionDef | undefined {
  return CMS_FOOTER_SECTIONS.find((s) => s.id === id);
}

export function cmsFooterPublicPath(slug: string): string {
  return `/info/${slug}`;
}

/** Footer slugs that render a built-in storefront page (not editable in Admin → CMS). */
export const STATIC_STOREFRONT_FOOTER_SLUGS = new Set(["about-indovyapar", "careers"]);

const STATIC_STOREFRONT_COMPONENT: Record<string, string> = {
  "about-indovyapar": "AboutIndovyaparPage",
  careers: "CareersPage",
};

export function isStaticStorefrontFooterSlug(slug: string): boolean {
  return STATIC_STOREFRONT_FOOTER_SLUGS.has(slug);
}

export function getStaticStorefrontFooterComponent(slug: string): string | null {
  return STATIC_STOREFRONT_COMPONENT[slug] ?? null;
}

/** Flat rows for Prisma seed. */
export function getAllCmsFooterSeeds(): {
  slug: string;
  sectionId: CmsFooterSectionId;
  title: string;
}[] {
  return CMS_FOOTER_SECTIONS.flatMap((section) =>
    section.pages.map((p) => ({
      slug: p.slug,
      sectionId: section.id,
      title: p.label,
    }))
  );
}
