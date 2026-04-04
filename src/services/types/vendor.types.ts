/**
 * Vendor dashboard API types.
 */

export type VendorProductStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "inactive";

export interface VendorProductListItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  stock: number;
  status: VendorProductStatus;
  rejectionReason?: string | null;
  lastUpdated: string;
  imageUrl?: string | null;
}

/** Current vendor session (GET /api/vendor/me). */
export interface VendorMeResponse {
  vendorId: string;
  email: string;
  role: string;
  status: string;
  rawStatus: string | null;
  statusReason: string | null;
  businessName: string | null;
  emailVerified: boolean;
}

/** Payload for creating a product (POST /api/vendor/products). */
export interface CreateVendorProductPayload {
  name: string;
  description?: string;
  categorySlug: string;
  subCategorySlug: string;
  sku: string;
  mrp: number;
  sellingPrice: number;
  gstPercent?: number;
  stock: number;
  returnPolicy?: "no-return" | "7days" | "10days" | "15days";
  status?: "DRAFT" | "PENDING_APPROVAL";
  imageUrls?: string[];
  specifications?: { key: string; value: string }[];
  variations?: { name: string; values: string[] }[];
  /** SKU rows (color/size + price/stock). Omit or [] = simple product pricing. */
  variants?: {
    color?: string;
    size?: string;
    price: number;
    stock: number;
    sku?: string;
    image?: string;
    images?: string[];
  }[];
}

export interface CreateVendorProductResponse {
  id: string;
  name: string;
  sku: string;
  status: string;
  createdAt: string;
}

/** Single product for edit (GET /api/vendor/products/:productId). */
export interface VendorProductForEdit {
  id: string;
  name: string;
  description: string | null;
  categorySlug: string;
  subCategorySlug: string;
  sku: string;
  mrp: number;
  sellingPrice: number;
  gstPercent: number | null;
  stock: number;
  returnPolicy: "no-return" | "7days" | "10days" | "15days";
  status: string;
  rejectionReason?: string | null;
  imageUrls: string[];
  specifications: { key: string; value: string }[];
  variations: { name: string; values: string[] }[];
  skuVariants: {
    id: string;
    color: string | null;
    size: string | null;
    price: number;
    stock: number;
    sku: string | null;
    image: string | null;
    images: string[];
  }[];
}

/** Payload for update (PUT) — same shape as create. */
export type UpdateVendorProductPayload = CreateVendorProductPayload;

// ---------------------------------------------------------------------------
// Vendor orders (list)
// ---------------------------------------------------------------------------

export type VendorOrderListStatus =
  | "new"
  | "accepted"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "rejected";

export interface VendorOrderListItem {
  id: string;
  date: string;
  createdAt?: string;
  customer: string;
  phone: string;
  amount: number;
  paymentMode: string;
  status: VendorOrderListStatus;
  itemsCount: number;
}

// ---------------------------------------------------------------------------
// Vendor earnings
// ---------------------------------------------------------------------------

export interface VendorEarningsSummary {
  gross: number;
  commission: number;
  net: number;
}

export interface VendorEarningsRow {
  orderId: string;
  orderDate: string;
  grossAmount: number;
  commissionPercent: number;
  commissionAmount: number;
  netEarning: number;
  payoutStatus: "paid" | "unpaid";
  payoutRef: string | null;
}

export interface VendorEarningsResult {
  summary: VendorEarningsSummary;
  rows: VendorEarningsRow[];
}

export interface VendorEarningsParams {
  dateFrom?: string;
  dateTo?: string;
  orderId?: string;
  payoutStatus?: "all" | "paid" | "unpaid";
}

// ---------------------------------------------------------------------------
// Vendor payouts
// ---------------------------------------------------------------------------

export interface VendorPayoutListItem {
  id: string;
  period: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  paidDate: string | null;
  reference: string | null;
  ordersCount: number;
}

export interface VendorPayoutsSummary {
  totalPayouts: number;
  transactionCount: number;
  lastPayoutAmount: number | null;
  lastPayoutDate: string | null;
  ordersPaid: number;
}

export interface VendorBankAccount {
  accountHolderName: string;
  accountNumberMasked: string;
  ifscCode: string;
  bankName: string;
}

export interface VendorPayoutsResult {
  summary: VendorPayoutsSummary;
  payouts: VendorPayoutListItem[];
  bankAccount: VendorBankAccount | null;
}

export interface VendorPayoutsParams {
  dateFrom?: string;
  dateTo?: string;
}

// ---------------------------------------------------------------------------
// Vendor reports summary
// ---------------------------------------------------------------------------

export interface VendorReportsSummary {
  ordersThisMonth: number;
  productsListed: number;
  totalEarnings: number;
}

export interface VendorOrdersParams {
  dateFrom?: string;
  dateTo?: string;
}

export interface VendorProductsParams {
  dateFrom?: string;
  dateTo?: string;
}

// ---------------------------------------------------------------------------
// Vendor profile & KYC
// ---------------------------------------------------------------------------

export interface VendorProfileBusiness {
  displayName: string;
  legalName: string;
  businessType: string;
  gstin: string;
  gstNotApplicable: boolean;
  pan: string;
  websiteUrl?: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  pickupPincode: string;
  storeLogo: string;
  storeDescription: string;
}

export interface VendorProfileOwner {
  ownerName: string;
  mobile: string;
  mobileVerified: boolean;
  email: string;
  emailVerified: boolean;
}

export interface VendorProfileBank {
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  bankProofUrl: string | null;
}

export interface VendorProfileDocument {
  documentType: string;
  fileUrl: string | null;
  status: string;
}

export interface VendorProfileData {
  status: "draft" | "submitted" | "approved" | "rejected" | "suspended" | "on_hold";
  statusReason?: string | null;
  primaryCategoryId?: string | null;
  /** Category IDs the vendor can add products to. */
  allowedCategoryIds: string[];
  business: VendorProfileBusiness;
  owner: VendorProfileOwner;
  bank: VendorProfileBank | null;
  documents: VendorProfileDocument[];
  vendorDocuments?: { id: string; documentName: string; documentUrl: string }[];
}

export interface UpdateVendorProfilePayload {
  business?: Partial<VendorProfileBusiness>;
  owner?: Partial<VendorProfileOwner>;
  bank?: Partial<Omit<VendorProfileBank, "bankProofUrl">>;
  status?: "draft" | "submitted";
  primaryCategoryId?: string | null;
  /** Category IDs the vendor can sell in. */
  allowedCategoryIds?: string[];
}

export interface VendorSupportTicketItem {
  id: string;
  subject: string;
  category: string;
  message: string;
  status: string;
  adminReply?: string | null;
  adminRepliedAt?: string | null;
  createdAt: string;
}

export interface SubmitSupportTicketPayload {
  subject: string;
  category: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Vendor notifications
// ---------------------------------------------------------------------------

export type VendorNotificationType = "SYSTEM" | "ORDER" | "SELLER" | "PAYMENT" | "RETURN";

export interface VendorNotificationItem {
  id: string;
  type: VendorNotificationType;
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface VendorNotificationsResult {
  notifications: VendorNotificationItem[];
  unreadCount: number;
}

// ---------------------------------------------------------------------------
// Vendor dashboard
// ---------------------------------------------------------------------------

export interface VendorDashboardRecentOrder {
  id: string;
  displayId: string;
  date: string;
  customer: string;
  amount: number;
  status: string;
  timeAgo: string;
}

export interface VendorDashboardLowStockProduct {
  id: string;
  name: string;
  sku: string;
  stock: number;
}

export interface VendorDashboardSummary {
  todayOrdersCount: number;
  pendingOrdersCount: number;
  totalRevenue30d: number;
  commission30d: number;
  netPayable: number;
  todayOrdersChangePercent: number | null;
  recentOrders: VendorDashboardRecentOrder[];
  lowStockProducts: VendorDashboardLowStockProduct[];
}
