/** Category URL slugs that map to special product menus (not DB categories). */
export const MENU_TYPE_SLUGS = ["deals", "new-arrivals", "best-sellers"] as const;

export type MenuTypeSlug = (typeof MENU_TYPE_SLUGS)[number];

export function isMenuTypeSlug(s: string): s is MenuTypeSlug {
  return (MENU_TYPE_SLUGS as readonly string[]).includes(s);
}
