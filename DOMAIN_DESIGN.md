# Domain Design — Multi-Vendor E-Commerce (MarketHub / Indo-Vyapar)

This document defines the domain model inferred from the Figma-exported React UI. It is **not** a database schema; it is a structured domain design for entities, relationships, constraints, and enums.

---

## 1. Domain Entities (Implied by UI)

### 1.1 Actor / Identity

| Entity | Source | Description |
|--------|--------|-------------|
| **User** | Login, Register, MyProfile, AddressManagement, Wishlist, MyOrders, SupportTickets, Checkout | Customer: email, password, profile, addresses, wishlist, orders, support tickets |
| **Admin** | AdminLogin, AdminDashboard, AdminProfileSettings | Platform administrator: auth, dashboard, settings, manages platform |
| **Seller** (Vendor) | SellerLogin, VendorDashboard, SellerDetailPage, KYCApprovalPage, VendorLayout | Seller/Vendor: business info, KYC, bank details, products, orders, earnings, payouts, support; status lifecycle (draft → submitted → approved / rejected / suspended) |

*Note: "Seller" and "Vendor" are used interchangeably in the UI; treat as one entity (Seller) with a vendor-facing dashboard.*

### 1.2 Catalog

| Entity | Source | Description |
|--------|--------|-------------|
| **Category** | HomePage, CategoryListing, SubCategoryListing, VendorProductForm, Admin CategoriesManagement | Top-level category (e.g. Electronics, Fashion); slug, name, status |
| **SubCategory** | SubCategoryListing, VendorProductForm, Product | Child of Category (e.g. Mobile Phones, Laptops); slug, name |
| **Product** | ProductDetail, SearchResults, VendorProductForm, VendorProductsList, ProductModeration, Cart, Wishlist, Order items | Listing: name, description, SKU, MRP, selling price, GST, stock, return policy, status (draft/pending/active/rejected), category, subcategory, seller |
| **ProductImage** | ProductDetail, VendorProductForm | Product images (multiple per product) |
| **ProductSpecification** | ProductDetail, VendorProductForm | Key-value specs (e.g. Brand, Model, Color) |
| **ProductVariation** | ProductDetail, VendorProductForm, Cart | Variation name + values (e.g. Color: Black, White; Size: S, M, L) |

### 1.3 Commerce

| Entity | Source | Description |
|--------|--------|-------------|
| **Order** | Checkout, OrderConfirmation, MyOrders, Admin OrdersManagement, VendorOrdersList, VendorOrderDetail, Admin OrderDetailPage | Order: customer, shipping address, payment, status timeline, line items; links to seller per item or per order |
| **OrderItem** | Order detail, Vendor order detail, Cart-like structure | Line item: product/SKU, quantity, price, seller (for multi-vendor) |
| **OrderStatusEvent** | Admin OrderDetailPage, VendorOrderDetail | Timeline: status (e.g. Placed, Payment Confirmed, Processing, Shipped, Delivered), timestamp |
| **Cart** | ShoppingCartPage, Checkout | Session or user cart: items, quantities, coupon; may be logical (derived from CartItem) |
| **CartItem** | Cart UI | Product/variant, quantity |
| **Payment** | Checkout, Order detail, Vendor order | Payment: mode (card/COD/wallet etc.), status, transaction id, amount, order |
| **Coupon** | ShoppingCartPage | Code, discount (e.g. percentage), validity |

### 1.4 User Data & Support

| Entity | Source | Description |
|--------|--------|-------------|
| **Address** | Checkout, AddNewAddress, AddressManagement | Customer address: type (Home/Office), full name, line1, line2, city, state, pincode, phone, isDefault |
| **WishlistItem** | WishlistPage | User + Product (and optionally variant) |
| **SupportTicket** | SupportTicketsPage | Ticket: subject, status (Open / In Progress / Resolved), dates, last update; belongs to user (and optionally order) |
| **Return** | Admin ReturnsManagement, Notifications | Return request: order, seller, customer, refund amount, reason, status (Pending / Approved / Rejected), date |

### 1.5 Seller / Vendor Lifecycle & Finance

| Entity | Source | Description |
|--------|--------|-------------|
| **KYCDocument** | KYCApprovalPage, SellerDetailPage | Document type (PAN, GST, Address Proof), identifier/number, file reference, seller, verification status |
| **BankAccount** | SellerDetailPage (Bank Details tab) | Seller bank: bank name, account holder, masked account number, IFSC |
| **Settlement** | Admin SettlementDashboard | Admin view: seller, period, revenue, commission, payout amount, status (Pending / Processing / Completed) |
| **Payout** | VendorPayouts, VendorEarnings | Vendor payout record: period, amount, status (paid/pending), paid date, reference (e.g. NEFT), orders count |
| **Earnings** | VendorOrderDetail, VendorEarnings | Per-order or aggregated: item total, commission %, commission amount, net payable |

### 1.6 Content & Notifications

| Entity | Source | Description |
|--------|--------|-------------|
| **Review** | ProductDetailPageEnhanced | Product review: user, rating (1–5), comment, date, verified purchase, helpful count, optional images |
| **ProductQuestion** | ProductDetailPageEnhanced | Q&A: question, answer, asked by, answered by (e.g. seller), helpful count, date |
| **Notification** | Admin NotificationsManagement, VendorNotifications | Type (System / Order / Seller / Payment / Return), title, message, date, read flag; recipient can be admin, seller, or user |

### 1.7 Auth & Security (Supporting)

| Concept | Source | Description |
|---------|--------|-------------|
| **OTP** | OTPVerificationPage | One-time password for login/verify (transient) |
| **PasswordReset** | ForgotPassword, ResetPassword | Token + new password (transient) |
| **Role** | Implicit | Admin, Customer, Seller |

---

## 2. Domain Model: Entities, Relationships, Cardinality

### 2.1 Core Entities

- **User** — Customer identity and profile (1:1 with CustomerProfile if split).
- **Admin** — Platform admin identity (separate from User or role on User).
- **Seller** — Vendor/seller; has business info, KYC status, bank account(s); 1:1 with a user/account for login.
- **Product** — Catalog item; belongs to one Category and one SubCategory; owned by one Seller.
- **Order** — Purchase order; belongs to one User (customer); has one shipping Address, one Payment; contains one or more OrderItems.
- **OrderItem** — Single line in an order; references Product (or SKU/variant), quantity, price; can reference Seller for commission/settlement.

### 2.2 Supporting Entities

- **Category** — Product category (parent of SubCategory).
- **SubCategory** — Child of Category; Product belongs to one SubCategory.
- **ProductImage** — Many per Product.
- **ProductSpecification** — Many key-value pairs per Product.
- **ProductVariation** — Variation name + set of values; many per Product (e.g. Color, Size).
- **Address** — Many per User; one can be default.
- **CartItem** — Many per User (or per session); references Product/variant, quantity.
- **WishlistItem** — Many per User; references Product (and optionally variant).
- **Review** — Many per Product; one per (User, Product) or (User, OrderItem) for “verified”.
- **ProductQuestion** — Many per Product; has answer, asked/answered by.
- **SupportTicket** — Many per User; optional link to Order.
- **Return** — One per Order (or per OrderItem for partial returns); links Order, Seller, User, amount, reason, status.
- **KYCDocument** — Many per Seller; type (PAN, GST, Address Proof), file, status.
- **BankAccount** — One or more per Seller (primary + optional).
- **Settlement** — Admin-side; per Seller per period; revenue, commission, payout, status.
- **Payout** — Vendor-side payout record; per Seller; period, amount, status, reference.
- **OrderStatusEvent** — Many per Order; status + timestamp (timeline).
- **Notification** — Many; target can be Admin, Seller, or User; type, read flag.
- **Coupon** — Code, discount rule, validity (can apply to Order/Cart).

### 2.3 Relationship Matrix (Cardinality)

| From | To | Relationship | Cardinality |
|------|----|---------------|-------------|
| User | Address | has | 1:N |
| User | Order | places | 1:N |
| User | CartItem | has | 1:N |
| User | WishlistItem | has | 1:N |
| User | SupportTicket | opens | 1:N |
| User | Review | writes | 1:N |
| Admin | (manages) | — | N:1 with platform (conceptual) |
| Seller | User/Account | is (one account) | 1:1 (or N:1 if multiple sellers per account) |
| Seller | Product | owns | 1:N |
| Seller | OrderItem | receives (fulfills) | 1:N (each item has one seller) |
| Seller | KYCDocument | has | 1:N |
| Seller | BankAccount | has | 1:N (one primary) |
| Seller | Settlement | receives | 1:N |
| Seller | Payout | receives | 1:N |
| Seller | Return | involved in | 1:N (return pertains to seller’s items) |
| Category | SubCategory | has | 1:N |
| SubCategory | Product | categorizes | 1:N |
| Product | ProductImage | has | 1:N |
| Product | ProductSpecification | has | 1:N |
| Product | ProductVariation | has | 1:N (variation name → many values) |
| Product | Review | has | 1:N |
| Product | ProductQuestion | has | 1:N |
| Order | OrderItem | contains | 1:N |
| Order | Payment | has | 1:1 (or 1:N if multiple payments) |
| Order | OrderStatusEvent | has | 1:N (timeline) |
| Order | Address | ships to | N:1 (one shipping address per order) |
| Order | Return | may have | 1:N (one or more return requests) |
| OrderItem | Product | references | N:1 |
| OrderItem | Seller | fulfilled by | N:1 (for commission/settlement) |
| WishlistItem | Product | references | N:1 |
| CartItem | Product | references | N:1 |
| SupportTicket | Order | optional link | N:1 |
| Return | Order | for | N:1 |
| Return | Seller | against (seller’s items) | N:1 |
| Notification | User / Admin / Seller | targets | N:1 (recipient) |
| Coupon | Order | applied to | 0..1:1 (one coupon per order) |

### 2.4 Multi-Vendor Order Model

- One **Order** can contain **OrderItems** from multiple Sellers.
- Each **OrderItem** is tied to one **Product** and one **Seller** (fulfiller).
- **Earnings** (commission, net payable) are computed per Seller per Order or per OrderItem; **Settlement** and **Payout** aggregate at Seller + period level.

---

## 3. Indexes, Uniqueness, Soft Delete, Audit

### 3.1 Recommended Indexes (Logical)

- **User**: email (unique lookup), phone if used for login.
- **Admin**: login identifier (e.g. email).
- **Seller**: external id/slug; (account_id or user_id) for “one seller per account”; KYC status for admin filters.
- **Category**: slug (unique); parent_id for tree.
- **SubCategory**: (category_id, slug) unique; category_id for listing.
- **Product**: seller_id + status; category_id, subcategory_id; SKU (unique per seller); full-text on name/description for search; created_at for “newest”.
- **Order**: user_id; status; created_at; (seller_id if denormalized) or via OrderItem.
- **OrderItem**: order_id; product_id; seller_id (for vendor dashboards and settlements).
- **Address**: user_id; user_id + is_default.
- **CartItem**: user_id (or session_id); (user_id, product_id, variant) for upsert.
- **WishlistItem**: (user_id, product_id) unique.
- **Review**: product_id; (user_id, product_id) if one review per user per product; created_at.
- **SupportTicket**: user_id; status; created_at.
- **Return**: order_id; seller_id; status; created_at.
- **Settlement**: seller_id; period (e.g. start/end date); status.
- **Payout**: seller_id; period; status; paid_date.
- **Notification**: recipient_id + recipient_type; read; created_at.
- **OrderStatusEvent**: order_id; occurred_at.

### 3.2 Unique Constraints (Logical)

- **User**: email (unique).
- **Seller**: (account_id or user_id) if one seller per account; business identifiers (GST, PAN) where applicable.
- **Category**: slug (global).
- **SubCategory**: (category_id, slug).
- **Product**: (seller_id, sku) — SKU unique per seller.
- **WishlistItem**: (user_id, product_id) [and optionally variant key].
- **CartItem**: (user_id, product_id, variant_key) if one row per variant in cart.
- **Coupon**: code (unique).
- **KYCDocument**: (seller_id, document_type) if one document per type per seller.

### 3.3 Soft Delete Strategy

- **Product**: `deleted_at`; keep for order history and analytics; hide from catalog when not null.
- **User**: `deleted_at`; anonymize PII in orders/addresses per policy; keep orders referable.
- **Seller**: `deleted_at`; retain for settlements, returns, and history.
- **Order**: Prefer **no** soft delete; use status (e.g. Cancelled) instead so financial and legal trail is clear.
- **Category / SubCategory**: `deleted_at`; products can keep FK with “deleted” category for history.
- **Address**: `deleted_at`; do not use for new orders once deleted.
- **SupportTicket**, **Return**, **Notification**: Optional `deleted_at` for audit; often status is enough (e.g. Closed, Rejected).
- **Review / ProductQuestion**: Optional soft delete for moderation (hide, keep for analytics).

### 3.4 Audit Fields (All Relevant Entities)

- **createdAt** (required): creation time, UTC.
- **updatedAt** (required): last update time, UTC.
- **createdBy** (optional): user/seller/admin id for sensitive entities (e.g. Order, Return, Settlement).
- **updatedBy** (optional): last modifier id where applicable.

Apply to: User, Admin, Seller, Category, SubCategory, Product, ProductImage, ProductSpecification, ProductVariation, Order, OrderItem, OrderStatusEvent, Address, CartItem, WishlistItem, Review, ProductQuestion, SupportTicket, Return, KYCDocument, BankAccount, Settlement, Payout, Payment, Notification, Coupon.

---

## 4. Enum Types (Suggested)

| Enum | Values | Use In |
|------|--------|--------|
| **UserRole** | CUSTOMER, SELLER, ADMIN | Account/role assignment |
| **SellerStatus** | DRAFT, SUBMITTED, APPROVED, REJECTED, SUSPENDED | Seller lifecycle (VendorLayout) |
| **ProductStatus** | DRAFT, PENDING_APPROVAL, ACTIVE, REJECTED, INACTIVE | Product moderation, listing |
| **OrderStatus** | PLACED, PAYMENT_CONFIRMED, PROCESSING, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, RETURNED | Order timeline, filters |
| **OrderItemStatus** | NEW, ACCEPTED, REJECTED, SHIPPED, DELIVERED, CANCELLED | Vendor order detail actions |
| **PaymentMode** | PREPAID, COD, WALLET, CARD, UPI, etc. | Payment, checkout |
| **PaymentStatus** | PENDING, PAID, FAILED, REFUNDED, PARTIALLY_REFUNDED | Payment |
| **AddressType** | HOME, OFFICE, OTHER | Address |
| **SupportTicketStatus** | OPEN, IN_PROGRESS, RESOLVED, CLOSED | SupportTicket |
| **ReturnStatus** | PENDING, APPROVED, REJECTED, REFUNDED | Return |
| **KYCStatus** | PENDING, APPROVED, REJECTED | Seller KYC / KYCDocument |
| **KYCDocumentType** | PAN, GST_CERTIFICATE, ADDRESS_PROOF | KYCDocument |
| **SettlementStatus** | PENDING, PROCESSING, COMPLETED | Settlement |
| **PayoutStatus** | PENDING, PAID, FAILED | Payout |
| **NotificationType** | SYSTEM, ORDER, SELLER, PAYMENT, RETURN | Notification |
| **ReturnPolicy** | 7_DAYS, 15_DAYS, 30_DAYS, NO_RETURN | Product (VendorProductForm) |

---

## 5. Scalability & Normalization

### 5.1 Normalization

- **Categories**: Category and SubCategory in separate entities; SubCategory has `category_id`; Product has `subcategory_id` (and optionally `category_id` for denormalized listing).
- **Product specs**: ProductSpecification as 1:N key-value; avoid JSON if you need to query/filter by spec.
- **Variants**: ProductVariation as structure (e.g. name + list of values); OrderItem/CartItem store chosen variant (e.g. variant_sku or variant_id) to avoid storing product + free text.
- **Order**: Order header + OrderItem lines; Payment and Address as FKs; avoid storing full customer snapshot except for historical copy if required by law.
- **Earnings**: Derive from OrderItem (quantity × price, commission %); store in Settlement/Payout aggregates; avoid duplicating full order payload in settlement.

### 5.2 Scalability

- **Search**: Product search by name/description → full-text index or external search (e.g. Elasticsearch); category/seller/price filters via indexed columns.
- **Orders**: Index (user_id, created_at), (seller_id, created_at) for lists; partition or archive by date if volume is very high.
- **Settlements/Payouts**: Index (seller_id, period); aggregate in background jobs; avoid heavy joins at read time.
- **Notifications**: Per-recipient index; consider marking read in batch and eventual consistency.
- **Reviews/Ratings**: Store aggregate (avg rating, count) on Product for listing; recalc or update on write.
- **Cart**: Prefer user-scoped CartItem table over session-only if you want cross-device; keep payload small (product_id, variant, qty).

### 5.3 Multi-Tenancy (Sellers)

- All seller-scoped data (Product, OrderItem fulfillment, Settlement, Payout, Return for seller, KYC, BankAccount) is tied to `seller_id`.
- Admin sees all; Seller sees only own data; Customer sees own orders and support tickets.
- Commission and payout rules can live in config or a separate CommissionRule table keyed by seller or global.

---

## 6. Summary: Entity Count and Grouping

- **Core (6)**: User, Admin, Seller, Product, Order, OrderItem  
- **Catalog (5)**: Category, SubCategory, ProductImage, ProductSpecification, ProductVariation  
- **Commerce (5)**: Payment, OrderStatusEvent, CartItem, Coupon, (Cart as logical)  
- **User data (3)**: Address, WishlistItem, SupportTicket  
- **Seller lifecycle (4)**: KYCDocument, BankAccount, Settlement, Payout  
- **Supporting (5)**: Return, Review, ProductQuestion, Notification, Earnings (logical/derived)

**Total: ~28 entity types** (excluding transient auth and optional profile split). This domain design is ready to be translated into a database schema (tables, columns, FKs) and API contracts in a later step.
