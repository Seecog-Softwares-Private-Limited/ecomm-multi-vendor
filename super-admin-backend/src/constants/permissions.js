export const PERMISSIONS = {
  SELLER_MANAGEMENT: "seller_management",
  CATALOG: "catalog",
  ORDERS: "orders",
  FINANCE: "finance",
  MARKETING: "marketing",
  SUPPORT: "support",
  SETTINGS: "settings",
};

export const PERMISSION_LABELS = {
  [PERMISSIONS.SELLER_MANAGEMENT]: "Seller Management (approve/reject sellers)",
  [PERMISSIONS.CATALOG]: "Catalog (categories, products, attributes)",
  [PERMISSIONS.ORDERS]: "Orders (view/update)",
  [PERMISSIONS.FINANCE]: "Finance (refunds, settlements)",
  [PERMISSIONS.MARKETING]: "Marketing (coupons, banners)",
  [PERMISSIONS.SUPPORT]: "Support (tickets, disputes)",
  [PERMISSIONS.SETTINGS]: "Settings",
};

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);
