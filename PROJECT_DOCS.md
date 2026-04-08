# Indo-Vyapar / MarketHub — Complete Project Documentation

> **Purpose:** This document is a complete, self-contained technical reference for the Indo-Vyapar multi-vendor e-commerce platform. It covers every layer — database, authentication, API, frontend, business logic, integrations, and deployment — so that any developer or AI can fully understand the system without access to the source code.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Environment Variables](#4-environment-variables)
5. [Database Schema](#5-database-schema)
6. [Authentication System](#6-authentication-system)
7. [Middleware & Route Protection](#7-middleware--route-protection)
8. [API Routes Reference](#8-api-routes-reference)
9. [Frontend Structure](#9-frontend-structure)
10. [Vendor Onboarding Flow](#10-vendor-onboarding-flow)
11. [Customer Shopping Flow](#11-customer-shopping-flow)
12. [Admin Panel](#12-admin-panel)
13. [Super Admin Panel](#13-super-admin-panel)
14. [Payment Flow (Razorpay)](#14-payment-flow-razorpay)
15. [Email & SMS Services](#15-email--sms-services)
16. [File Upload System](#16-file-upload-system)
17. [Notification System](#17-notification-system)
18. [Delivery / Pincode System](#18-delivery--pincode-system)
19. [CMS & Footer Pages](#19-cms--footer-pages)
20. [Guest Cart System](#20-guest-cart-system)
21. [Utility Libraries](#21-utility-libraries)
22. [Deployment (AWS Lightsail)](#22-deployment-aws-lightsail)

---

## 1. Project Overview

Indo-Vyapar (branded as "Indovyapar") is a **multi-vendor marketplace** built with Next.js 15 App Router. It operates as a single Next.js application that serves four distinct user roles:

| Role | Entry Point | Purpose |
|---|---|---|
| **Customer** | `/` (storefront) | Browse, search, buy products |
| **Vendor / Seller** | `/vendor/*` | List products, manage orders, view earnings |
| **Admin** | `/admin/*` | Moderate products, manage vendors, view analytics |
| **Super Admin** | `/superadmin/*` (separate backend) | Manage admin accounts, roles, audit logs |

The super admin panel is a **separate Express/Next.js backend** located in `super-admin-backend/`, accessed from the frontend via `NEXT_PUBLIC_SUPER_ADMIN_API_URL`.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.0.3 (App Router, React 18) |
| Language | TypeScript 5.7 |
| Database | MySQL (via Prisma ORM 5.22) |
| Authentication | Custom JWT (using `jose` library) |
| UI Components | Radix UI primitives + Tailwind CSS 4 |
| Icons | Lucide React |
| Payments | Razorpay |
| SMS | AWS SNS (for OTP) |
| Email | Nodemailer + SMTP (Brevo recommended) |
| File Uploads | Local filesystem (`public/uploads/`) |
| Validation | Zod |
| Toast Notifications | Sonner |
| Animation | Framer Motion (`motion`) |
| Charts | Recharts |
| HTTP Client | Native `fetch` |
| Process Manager | PM2 (production) |
| Hosting | AWS Lightsail (Node.js instance) |

---

## 3. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js App                             │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Storefront  │  │ Vendor Panel │  │    Admin Panel       │  │
│  │  /           │  │ /vendor/*    │  │    /admin/*          │  │
│  │  (Customer)  │  │ (Seller)     │  │    (Admin)           │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │              │
│  ┌──────▼─────────────────▼──────────────────────▼───────────┐  │
│  │                   app/api/* (Route Handlers)               │  │
│  │  withApiHandler() — unified error handling wrapper         │  │
│  └──────────────────────────┬────────────────────────────────┘  │
│                             │                                    │
│  ┌──────────────────────────▼────────────────────────────────┐  │
│  │              src/lib/* (Business Logic Layer)              │  │
│  │  auth/  data/  email/  sms/  uploads/  validation/        │  │
│  └──────────────────────────┬────────────────────────────────┘  │
│                             │                                    │
│  ┌──────────────────────────▼────────────────────────────────┐  │
│  │                  Prisma Client → MySQL                     │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼ External Services
   ┌─────────────┐   ┌──────────────┐   ┌────────────────────┐
   │  Razorpay   │   │  AWS SNS     │   │  SMTP (Brevo)      │
   │  (payments) │   │  (SMS OTP)   │   │  (email)           │
   └─────────────┘   └──────────────┘   └────────────────────┘
```

### Request Lifecycle

1. Request hits Next.js middleware (`middleware.ts`)
2. Middleware checks JWT cookie, enforces role-based redirects
3. Route handler receives request, wrapped in `withApiHandler()` for error normalization
4. Handler calls `requireSession()` or `getSession()` to authenticate
5. Handler calls data layer functions in `src/lib/data/`
6. Data layer uses Prisma client to query MySQL
7. Response returned as standardized JSON: `{ success: true, data: {...} }` or `{ success: false, error: { code, message } }`

---

## 4. Environment Variables

All configured in `.env` at project root (never committed to git).

```env
# App
PORT=3004
APP_URL="http://localhost:3004"
NEXT_PUBLIC_APP_URL="https://your-store.example.com"

# Database
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE"

# Auth
JWT_SECRET="your-secret-at-least-32-characters"
# Optional: AUTH_COOKIE_SECURE=false  (for HTTP-only deployments)

# Email (SMTP via Brevo or similar)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@yourdomain.com

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxx   # MUST match RAZORPAY_KEY_ID

# AWS SNS (customer phone OTP)
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# OAuth Social Login
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=

# Super Admin Backend URL
NEXT_PUBLIC_SUPER_ADMIN_API_URL=http://localhost:4000
```

---

## 5. Database Schema

Database: **MySQL**. ORM: **Prisma 5.22**. All PKs are UUID (`CHAR(36)`). Soft deletes use `deletedAt DateTime?`.

### Enums

| Enum | Values |
|---|---|
| `UserRole` | CUSTOMER, SELLER, ADMIN |
| `SellerStatus` | PENDING_VERIFICATION, DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, SUSPENDED, ON_HOLD |
| `ProductStatus` | DRAFT, PENDING_APPROVAL, ACTIVE, REJECTED, INACTIVE |
| `OrderStatus` | PLACED, PAYMENT_CONFIRMED, PROCESSING, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, RETURNED |
| `OrderItemStatus` | NEW, ACCEPTED, REJECTED, SHIPPED, DELIVERED, CANCELLED |
| `PaymentMode` | PREPAID, COD, WALLET, CARD, UPI, OTHER |
| `PaymentStatus` | PENDING, PAID, FAILED, REFUNDED, PARTIALLY_REFUNDED |
| `AddressType` | HOME, OFFICE, OTHER |
| `SupportTicketStatus` | OPEN, IN_PROGRESS, RESOLVED, CLOSED |
| `ReturnStatus` | PENDING, APPROVED, REJECTED, REFUNDED |
| `KYCStatus` | PENDING, APPROVED, REJECTED |
| `KYCDocumentType` | PAN, GST_CERTIFICATE, ADDRESS_PROOF |
| `SettlementStatus` | PENDING, PROCESSING, COMPLETED |
| `PayoutStatus` | PENDING, PAID, FAILED |
| `NotificationType` | SYSTEM, ORDER, SELLER, PAYMENT, RETURN |
| `ReturnPolicy` | DAYS_7, DAYS_15, DAYS_30, NO_RETURN |
| `AdminStatus` | ACTIVE, INACTIVE, SUSPENDED |
| `AdminApprovalStatus` | PENDING, APPROVED, REJECTED |

---

### Models

#### `users` — Customer accounts
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| email | VARCHAR(255) | unique |
| passwordHash | VARCHAR(255)? | **nullable** — null for OAuth-only accounts |
| firstName, lastName | VARCHAR(100)? | |
| phone | VARCHAR(20)? | |
| avatarUrl | VARCHAR(500)? | profile picture URL |
| emailVerified | Boolean | default true for existing, false for new signups |
| verificationToken | VARCHAR(64)? | email verification link token |
| verificationTokenExpires | DateTime? | |
| passwordResetToken | VARCHAR(255)? | |
| passwordResetExpires | DateTime? | |
| oauthProvider | VARCHAR(50)? | "google" or "facebook" |
| oauthProviderId | VARCHAR(255)? | provider's user ID |
| createdAt, updatedAt, deletedAt | DateTime | soft delete |

Relations: addresses, orders, cartItems, wishlistItems, supportTickets, reviews, notifications, productQuestionsAsked

---

#### `customer_phone_otps` — OTP records for phone login
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| phoneNorm | VARCHAR(20) | normalized phone number |
| codeHash | VARCHAR(128) | HMAC-SHA256 hash of OTP |
| expiresAt | DateTime | OTP expiry |
| attemptCount | Int | tracks failed attempts |
| consumedAt | DateTime? | set when OTP is used |

---

#### `sellers` — Vendor accounts
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| email | VARCHAR(255) | unique |
| passwordHash | VARCHAR(255) | required (no OAuth for vendors) |
| businessName | VARCHAR(255) | |
| ownerName | VARCHAR(255) | |
| phone | VARCHAR(20)? | |
| businessAddress | VARCHAR(500)? | |
| profileExtras | Text? | JSON blob for extra profile data |
| emailVerified | Boolean | default false |
| verificationToken | VARCHAR(255)? | |
| phoneVerified | Boolean | default false |
| phoneOtpCode | VARCHAR(100)? | hashed OTP for phone verification |
| phoneOtpExpires | DateTime? | |
| emailOtpCode | VARCHAR(100)? | hashed OTP for email re-verification |
| emailOtpExpires | DateTime? | |
| status | SellerStatus | vendor approval lifecycle |
| statusReason | Text? | admin rejection/suspension reason |
| primaryCategoryId | UUID? | FK to categories |
| restrictDeliveryToPincodes | Boolean | default false — if true, uses serviceablePincodes list |
| createdAt, updatedAt, deletedAt | DateTime | |

Relations: products, orderItems, kycDocuments, bankAccounts, vendorDocuments, settlements, payouts, returns, notifications, supportTickets, serviceablePincodes

---

#### `admins` — Admin panel users
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| email | VARCHAR(255) | unique |
| passwordHash | VARCHAR(255) | |
| name, phone | optional | |
| roleId | UUID? | FK to admin_roles |
| status | AdminStatus | ACTIVE/INACTIVE/SUSPENDED |
| approvalStatus | AdminApprovalStatus | must be APPROVED to log in |
| isSuperAdmin | Boolean | grants all permissions |

---

#### `admin_roles` — RBAC roles for admins
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(100) | unique role name |
| permissions | JSON | array of permission strings |
| description | VARCHAR(500)? | |

---

#### `admin_audit_logs` — Action trail for admins
| Field | Type | Notes |
|---|---|---|
| adminId | UUID | FK to admins |
| action | VARCHAR(100) | action performed |
| module | VARCHAR(100) | which module (products, sellers, etc.) |
| metadata | JSON? | extra context |
| ip, userAgent | optional | |

---

#### `categories` — Top-level product categories
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| slug | VARCHAR(100) | unique, URL-friendly |
| name | VARCHAR(255) | |
| sortOrder | Int? | display order |

Relations: subCategories, products, documentRequirements

---

#### `sub_categories` — Second-level categories
Belongs to one `Category`. Has `slug` unique within category (`[categoryId, slug]`).

---

#### `category_document_requirements` — Documents vendors must upload per category
| Field | Type | Notes |
|---|---|---|
| categoryId | UUID | FK to categories |
| documentName | VARCHAR(255) | e.g. "GST Certificate" |
| isRequired | Boolean | if true, mandatory for KYC |

---

#### `vendor_documents` — Custom documents uploaded by vendors
| Field | Type | Notes |
|---|---|---|
| sellerId | UUID | FK to sellers |
| documentName | VARCHAR(255) | vendor-defined name |
| documentUrl | VARCHAR(500) | file URL |
| unique constraint | `[sellerId, documentName]` | one doc per name per vendor |

---

#### `products` — Product catalog
| Field | Type | Notes |
|---|---|---|
| sellerId | UUID | which vendor owns this |
| categoryId, subCategoryId | UUID | classification |
| name | VARCHAR(500) | |
| description | Text? | |
| sku | VARCHAR(100) | unique per seller (`[sellerId, sku]`) |
| mrp, sellingPrice | Decimal(12,2) | |
| gstPercent | Decimal(5,2)? | |
| stock | Int | default 0 |
| returnPolicy | ReturnPolicy | 7/15/30 days or no return |
| status | ProductStatus | approval lifecycle |
| rejectionReason | Text? | admin rejection note |
| avgRating | Decimal(3,2)? | computed |
| reviewCount | Int? | |

Relations: images, specifications, variations, productVariants, reviews, questions, orderItems, cartItems, wishlistItems

---

#### `product_images` — Product gallery images
One product → many images. Each has `url` and `sortOrder`.

---

#### `product_specifications` — Key-value specs
e.g. `{ key: "Material", value: "Cotton" }`.

---

#### `product_variations` — Variation types (e.g. Color, Size)
Stores `name` (e.g. "Color") and `values` (JSON array e.g. `["Red","Blue"]`).

---

#### `product_variants` — Sellable SKU combinations
| Field | Type | Notes |
|---|---|---|
| productId | UUID | |
| color | VARCHAR(100)? | |
| size | VARCHAR(100)? | dynamic; multiple sizes supported via comma-separated or structured |
| price | Decimal(12,2) | variant-specific price |
| stock | Int | variant stock |
| sku | VARCHAR(100)? | optional variant SKU |
| image | VARCHAR(500)? | legacy single image (mirrors first of `images`) |
| images | JSON? | array of image URLs for this variant |

---

#### `addresses` — Customer delivery addresses
Fields: userId, type (HOME/OFFICE/OTHER), fullName, line1, line2, city, state, pincode, phone, isDefault.

---

#### `cart_items` — Shopping cart
One row per `(userId, productId, variantKey)`. `variantKey` is a string like `"color:Red|size:M"`.

---

#### `wishlist_items` — Saved for later
One row per `(userId, productId)`.

---

#### `orders` — Customer orders
| Field | Type | Notes |
|---|---|---|
| userId | UUID | customer |
| shippingAddressId | UUID | snapshot-like FK |
| couponId | UUID? | applied coupon |
| status | OrderStatus | |
| totalAmount | Decimal | |
| discountAmount, taxAmount, shippingAmount | Decimal? | |

Relations: items, payments, statusEvents, returns, supportTickets

---

#### `order_items` — Line items in an order
Each item belongs to one seller. Stores `variantSnapshot` (JSON of color/size at time of purchase), `commissionPercent`, `commissionAmount`, `netPayable`.

---

#### `order_status_events` — Audit trail of order status changes
`orderId`, `status`, `note`, `occurredAt`.

---

#### `payments` — Payment records
`orderId`, `mode`, `status`, `amount`, `transactionId` (Razorpay), `paidAt`.

---

#### `coupons` — Discount codes
`code` (unique), `discountType` (percent/flat), `discountValue`, `validFrom`, `validTo`, `maxUses`, `usedCount`.

---

#### `returns` & `return_items` — Return requests
Return belongs to an order + seller. ReturnItems reference specific order items with `quantity` and `refundAmount`.

---

#### `support_tickets` — Customer support tickets
`userId`, optional `orderId`, `subject`, `status`, `adminReply`, `adminRepliedAt`.

---

#### `vendor_support_tickets` — Vendor support tickets
Same structure but belongs to a `Seller`. Has `category` and `message` fields.

---

#### `reviews` — Product reviews
One review per `(userId, productId)`. Has `rating` (Int), `comment`, `verified` (purchased), `helpfulCount`.

---

#### `product_questions` — Q&A on products
`question` (asked by user), `answer` (answered by seller), `helpfulCount`.

---

#### `kyc_documents` — Vendor KYC files
One per `(sellerId, documentType)`. Types: PAN, GST_CERTIFICATE, ADDRESS_PROOF. Has `identifier` (PAN number, GST number) and `fileUrl`.

---

#### `bank_accounts` — Vendor bank details
`bankName`, `accountHolderName`, `accountNumber`, `ifscCode`, `isPrimary`.

---

#### `settlements` — Platform settlement records
Tracks revenue, commission, and payout amounts per seller per period.

---

#### `payouts` — Payout records
Actual money sent to vendor. Has `reference` (bank transaction ID), `paidAt`.

---

#### `notifications` — Polymorphic notifications
Recipient can be `userId`, `sellerId`, or `adminId` (one is set, others null). Has `type`, `title`, `message`, `read`, `readAt`.

---

#### `cms_footer_pages` — CMS content for footer info pages
`slug` (unique URL), `sectionId` (groups pages in footer), `title`, `content` (trusted HTML from admins).

---

#### `career_openings` — Job listings on /info/careers
`title`, `department`, `location`, `employmentType`, `description`, `published`, `sortOrder`.

---

#### `seller_serviceable_pincodes` — Per-seller delivery areas
When `seller.restrictDeliveryToPincodes = true`, only pincodes in this table are serviced.

---

#### `platform_delivery_config` — Global delivery restriction toggle
Single row (`id = "default"`). `restrictDeliveryToPincodes` — when true, only platform-level pincodes are serviceable.

---

#### `platform_serviceable_pincodes` — Platform-wide delivery areas
Used when `platform_delivery_config.restrictDeliveryToPincodes = true`.

---

## 6. Authentication System

### JWT Sessions

- All sessions are stored as **HTTP-only cookies** (not localStorage).
- Cookie name: `auth_token` (configurable via `AUTH_COOKIE_NAME`).
- Signed with HMAC-SHA256 using `JWT_SECRET` via the `jose` library.
- JWT payload: `{ sub: userId, email, role: "CUSTOMER"|"SELLER"|"ADMIN"|"SUPER_ADMIN" }`
- Default expiry: 7 days (configurable via `JWT_EXPIRES_IN`).
- `AUTH_COOKIE_SECURE=false` must be set for HTTP-only deployments (non-HTTPS).

**Key auth functions (`src/lib/auth/`):**
- `signToken(payload)` — signs a JWT
- `verifyToken(token)` — verifies + decodes a JWT, returns null if invalid
- `getSession(request)` — reads cookie, returns `JwtPayload | null`
- `requireSession(request)` — throws 401 if no valid session
- `setAuthCookie(response, token)` — sets the cookie on a response
- `hashPassword(plain)` — bcrypt hash (rounds=12)
- `verifyPassword(plain, hash)` — bcrypt compare

---

### Customer Authentication Flows

#### Email + Password Login
1. `POST /api/auth/login` — body: `{ email, password }`
2. Find user by email where `deletedAt IS NULL`
3. If `passwordHash` is null → user is OAuth-only, return 401 with message to use social login
4. `verifyPassword()` → if valid, `signToken({ sub: user.id, email, role: "CUSTOMER" })`
5. `setAuthCookie(response, token)` → redirect/return

#### Email Registration
1. `POST /api/auth/register` — body: `{ firstName, lastName, email, password, phone? }`
2. Validate with Zod
3. Hash password, create `User` with `emailVerified: false`
4. Send verification email with token
5. User clicks link → `GET /api/auth/verify-email?token=...` → sets `emailVerified: true`

#### Phone OTP Login (Amazon/Flipkart-style)
1. `POST /api/auth/phone-otp/send` — body: `{ phone }`
2. Normalize phone, generate 6-digit OTP, HMAC-SHA256 hash it
3. Store hash in `customer_phone_otps` table with 10-min expiry
4. Send SMS via AWS SNS
5. `POST /api/auth/phone-otp/verify` — body: `{ phone, code }`
6. Find active OTP record, verify hash, increment attempt count
7. If valid: find or create user, issue JWT

#### Social OAuth Login (Google & Facebook)
1. User clicks "Login with Google/Facebook" → link to `/api/auth/oauth/[provider]?returnUrl=/`
2. `GET /api/auth/oauth/[provider]` → generate CSRF state, set `oauth_state` cookie, redirect to provider's auth URL
3. Provider redirects to `/api/auth/oauth/[provider]/callback?code=...&state=...`
4. `GET /api/auth/oauth/[provider]/callback`:
   - Verify state cookie matches query param (CSRF check)
   - Exchange code for user info (name, email, avatar, providerId)
   - Find existing user by email OR create new user (`passwordHash: null`)
   - If existing: update `oauthProvider`, `oauthProviderId`, `avatarUrl`
   - Issue JWT, set auth cookie, redirect to `returnUrl`

#### Forgot / Reset Password
1. `POST /api/auth/forgot-password` — body: `{ email }`
2. Generate crypto token, store `passwordResetToken` + `passwordResetExpires` on user
3. Send reset email with link: `{APP_URL}/reset-password?token=...`
4. `POST /api/auth/reset-password` — body: `{ token, newPassword }`
5. Validate token not expired, hash new password, clear reset fields

---

### Vendor Authentication Flows

#### Vendor Registration
1. `POST /api/auth/vendor-register` — body: `{ businessName, ownerName, email, password, phone? }`
2. Create `Seller` with `status: PENDING_VERIFICATION`, `emailVerified: false`
3. Send verification email
4. Vendor clicks link → `GET /api/auth/verify-email?token=...&type=seller` → sets `emailVerified: true`, status → `DRAFT`
5. Vendor must submit profile for review → status → `SUBMITTED` → admin reviews → `APPROVED`

#### Vendor Login
1. `POST /api/auth/vendor-login` — body: `{ email, password }`
2. Find seller, verify password
3. Check `emailVerified` — if false, return 403 with "verify email first"
4. Issue JWT with `role: "SELLER"`, set cookie

#### Vendor OTP Verification (Phone & Email within Profile)
- Phone: `POST /api/vendor/verify/phone/send` → SMS OTP → `POST /api/vendor/verify/phone/confirm`
- Email: `POST /api/vendor/verify/email/send` → Email OTP → `POST /api/vendor/verify/email/confirm`
- OTP hashed with HMAC using `JWT_SECRET`, stored on `Seller` record

---

### Admin Authentication
1. `POST /api/auth/admin-login` — body: `{ email, password }`
2. Find admin, verify password
3. Check `approvalStatus === APPROVED` and `status === ACTIVE`
4. Issue JWT with `role: "ADMIN"`, set cookie

---

### Session Reading in API Routes
```typescript
// Optional session (returns null if not logged in)
const session = await getSession(request);

// Required session (throws 401 if not logged in)
const session = await requireSession(request);

// session shape: { sub: userId, email, role: "CUSTOMER"|"SELLER"|"ADMIN" }
```

---

## 7. Middleware & Route Protection

`middleware.ts` runs on every request using the Edge Runtime.

### Protected Route Rules

| Path Pattern | Required Role | Redirect if Unauthorized |
|---|---|---|
| `/profile`, `/my-orders`, `/cart`, `/checkout`, `/wishlist`, `/address-management`, `/add-address`, `/support-tickets`, `/order-confirmation` | Any authenticated user | `/login` |
| `/vendor/*` | SELLER or ADMIN | `/vendor/login` |
| `/admin/*` | ADMIN | `/admin/login` |

### Public Vendor Pages (no redirect)
`/vendor/login`, `/vendor/register`, `/vendor/forgot-password`, `/vendor/reset-password`

### Auth Pages
`/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`, `/otp-verification` — no redirect even if logged in.

---

## 8. API Routes Reference

All API routes use `withApiHandler()` which:
- Catches all thrown errors
- Maps `ApiRouteError` to custom HTTP status + error code
- Maps Prisma errors (P2002 unique, P2025 not found, P2021 missing table, etc.) to user-friendly messages
- Returns standardized JSON: `{ success: true, data: {...} }` or `{ success: false, error: { code, message } }`

### Standard Response Format
```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": { "code": "NOT_FOUND", "message": "User not found" } }
```

---

### Auth Routes (`/api/auth/`)

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Customer registration |
| POST | `/api/auth/login` | Public | Customer email+password login |
| POST | `/api/auth/logout` | Any | Clear auth cookie |
| GET | `/api/auth/me` | Customer | Get current user profile + avatarUrl |
| PATCH | `/api/auth/me/password` | Customer | Change password (blocks OAuth-only users) |
| POST | `/api/auth/me/avatar` | Customer | Upload profile picture (multipart, max 5MB) |
| GET | `/api/auth/verify-email` | Public | Verify email via token (customer & vendor) |
| POST | `/api/auth/forgot-password` | Public | Send customer reset email |
| POST | `/api/auth/reset-password` | Public | Reset customer password |
| POST | `/api/auth/phone-otp/send` | Public | Send SMS OTP to customer phone |
| POST | `/api/auth/phone-otp/verify` | Public | Verify SMS OTP → issue session |
| POST | `/api/auth/resend-customer-verification` | Public | Resend email verification link |
| POST | `/api/auth/vendor-register` | Public | Vendor registration |
| POST | `/api/auth/vendor-login` | Public | Vendor email+password login |
| POST | `/api/auth/vendor-forgot-password` | Public | Send vendor reset email |
| POST | `/api/auth/vendor-reset-password` | Public | Reset vendor password |
| POST | `/api/auth/admin-login` | Public | Admin login |
| GET | `/api/auth/oauth/[provider]` | Public | Initiate Google/Facebook OAuth (redirect) |
| GET | `/api/auth/oauth/[provider]/callback` | Public | OAuth callback handler |

---

### Customer — Cart (`/api/cart/`)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/cart/items` | Customer (or guest) | List cart items with product details |
| POST | `/api/cart/items` | Customer | Add item to cart |
| PATCH | `/api/cart/items/[id]` | Customer | Update item quantity |
| DELETE | `/api/cart/items/[id]` | Customer | Remove item from cart |

**Guest cart:** If no session, cart is stored in `localStorage` under key `indovyapar_guest_cart`. On login, guest cart items can be merged.

---

### Customer — Orders (`/api/orders/`)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/orders` | Customer | List own orders (with pagination) |
| POST | `/api/orders` | Customer | Place order (from cart, requires payment flow) |
| GET | `/api/orders/[id]` | Customer | Get order details |
| PATCH | `/api/orders/[id]` | Customer | Cancel/update order |

---

### Customer — Addresses (`/api/addresses/`)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/addresses` | Customer | List own addresses |
| POST | `/api/addresses` | Customer | Create new address |
| PATCH | `/api/addresses/[id]` | Customer | Update address |
| DELETE | `/api/addresses/[id]` | Customer | Soft-delete address |

---

### Customer — Wishlist (`/api/wishlist/`)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/wishlist` | Customer | List wishlist items |
| POST | `/api/wishlist` | Customer | Add to wishlist |
| DELETE | `/api/wishlist/[id]` | Customer | Remove from wishlist |

---

### Customer — Support Tickets (`/api/support-tickets/`)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/support-tickets` | Customer | List own tickets (filter by status) |
| POST | `/api/support-tickets` | Customer | Create ticket (subject required) |
| GET | `/api/support-tickets/[id]` | Customer | Get ticket detail |

---

### Products — Public (`/api/products/`)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | Public | Search/filter products (category, subcategory, price, rating, brand, pincode) |
| GET | `/api/products/[id]` | Public | Get product detail with variants, images, specs |
| GET | `/api/products/[id]/reviews` | Public | Get product reviews |
| POST | `/api/products/[id]/reviews` | Customer | Submit review |
| GET | `/api/products/[id]/questions` | Public | Get product Q&A |
| POST | `/api/products/[id]/questions` | Customer | Ask a question |
| GET | `/api/products/[id]/delivery-eligibility` | Public | Check if pincode is serviceable |
| GET | `/api/products/brands` | Public | List brands for filter |
| GET | `/api/products/rating-facets` | Public | Rating distribution for filters |

---

### Categories — Public (`/api/categories/`)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/categories` | Public | List all categories with subcategories |

---

### Payments (`/api/payments/`)

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/payments/razorpay-order` | Customer | Create Razorpay order (returns order_id) |
| POST | `/api/payments/verify` | Customer | Verify Razorpay payment signature + update order |

---

### CMS — Public (`/api/cms/`)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/cms/footer-pages/[slug]` | Public | Get CMS page content by slug |

---

### Careers — Public (`/api/careers/`)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/careers/openings` | Public | List published job openings |

---

### Uploads (`/api/uploads/`)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/uploads/[[...path]]` | Public | Serve uploaded files from public/uploads/ |

---

### Health & Docs

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Returns `{ ok: true }` |
| GET | `/api/openapi` | Public | OpenAPI/Swagger spec |

---

### Vendor Routes (`/api/vendor/`)

All require `role: SELLER` unless noted.

| Method | Route | Description |
|---|---|---|
| GET | `/api/vendor/me` | Get vendor profile + KYC status |
| GET | `/api/vendor/dashboard` | Dashboard stats (orders, revenue, products) |
| GET | `/api/vendor/earnings` | Earnings summary |
| GET | `/api/vendor/payouts` | Payout history |
| GET | `/api/vendor/reports/summary` | Detailed reports |
| GET/PATCH | `/api/vendor/profile` | Get/update vendor profile |
| POST | `/api/vendor/profile/documents` | Upload KYC document (multipart) |
| GET/POST | `/api/vendor/profile/vendor-documents` | List / upload custom documents |
| DELETE | `/api/vendor/profile/vendor-documents/[id]` | Delete a custom document |
| GET/POST | `/api/vendor/products` | List vendor products / create product |
| GET/PUT/DELETE | `/api/vendor/products/[productId]` | Get/update/delete product |
| POST | `/api/vendor/submit-for-approval` | Submit vendor profile for admin review |
| GET | `/api/vendor/orders` | List vendor's order items |
| GET/PATCH | `/api/vendor/orders/[orderId]` | Order detail / update item status |
| GET/POST | `/api/vendor/notifications` | List notifications / mark all read |
| PATCH | `/api/vendor/notifications/[id]` | Mark single notification as read |
| GET/POST | `/api/vendor/support/tickets` | Vendor support tickets |
| POST | `/api/vendor/verify/phone/send` | Send OTP to vendor phone |
| POST | `/api/vendor/verify/phone/confirm` | Verify phone OTP |
| POST | `/api/vendor/verify/email/send` | Send OTP to vendor email |
| POST | `/api/vendor/verify/email/confirm` | Verify email OTP |
| GET | `/api/vendor/categories` | List categories for product form |
| GET | `/api/vendor/subcategories` | List subcategories (filtered by category) |
| GET | `/api/vendor/category-document-requirements` | Required docs for vendor's category |
| GET/POST/DELETE | `/api/vendor/service-pincodes` | Manage serviceable pincodes |
| POST | `/api/vendor/upload` | Generic file upload (product images) |

---

### Admin Routes (`/api/admin/`)

All require `role: ADMIN`.

| Method | Route | Description |
|---|---|---|
| GET | `/api/admin/me` | Get admin profile |
| PATCH | `/api/admin/me/password` | Change admin password |
| GET | `/api/admin/dashboard` | Admin dashboard stats |
| GET | `/api/admin/analytics` | Sales analytics data |
| GET | `/api/admin/sellers` | List all vendors (with filters) |
| GET | `/api/admin/sellers/[sellerId]` | Vendor detail with KYC |
| PATCH | `/api/admin/sellers/[sellerId]` | Update vendor status (approve/reject/suspend) |
| GET/PATCH | `/api/admin/sellers/[sellerId]/kyc` | View/update KYC documents |
| POST | `/api/admin/sellers/[sellerId]/kyc/approve` | Approve vendor KYC |
| POST | `/api/admin/sellers/[sellerId]/block` | Block/unblock vendor |
| GET | `/api/admin/products` | List all products (moderation queue) |
| GET | `/api/admin/products/[productId]` | Product detail |
| POST | `/api/admin/products/[productId]/approve` | Approve product |
| POST | `/api/admin/products/[productId]/reject` | Reject product with reason |
| DELETE | `/api/admin/products/[productId]/delete` | Soft-delete product |
| GET | `/api/admin/orders` | List all orders |
| GET/PATCH | `/api/admin/orders/[orderId]` | Order detail / update status |
| GET | `/api/admin/returns` | List return requests |
| GET | `/api/admin/settlements` | Settlement overview |
| GET | `/api/admin/notifications` | Admin notifications |
| PATCH | `/api/admin/notifications/[id]` | Mark notification as read |
| PATCH | `/api/admin/notifications/[id]/read` | Mark read (alias) |
| GET/POST | `/api/admin/categories` | List categories / create category |
| GET/PUT/DELETE | `/api/admin/categories/[categoryId]` | Manage category |
| GET/POST/DELETE | `/api/admin/categories/[categoryId]/document-requirements` | Manage category doc requirements |
| GET/POST | `/api/admin/cms/footer-pages` | List/create CMS footer pages |
| GET/PUT/DELETE | `/api/admin/cms/footer-pages/[slug]` | Manage a footer page |
| GET/POST | `/api/admin/cms/career-openings` | List/create job openings |
| GET/PUT/DELETE | `/api/admin/cms/career-openings/[id]` | Manage a job opening |
| GET | `/api/admin/support-tickets` | All customer support tickets |
| POST | `/api/admin/support-tickets/[ticketId]/reply` | Admin reply to ticket |
| GET/PATCH | `/api/admin/platform/service-pincodes` | Manage platform-wide pincodes |

---

### Super Admin Routes (`/api/superadmin/`)

These routes power the Super Admin panel (separate backend proxied here).

| Method | Route | Description |
|---|---|---|
| POST | `/api/superadmin/auth/login` | Super admin login |
| GET/POST | `/api/superadmin/admins` | List/create admin accounts |
| GET/PUT/DELETE | `/api/superadmin/admins/[id]` | Manage admin account |
| POST | `/api/superadmin/admins/[id]/approve` | Approve admin account |
| PATCH | `/api/superadmin/admins/[id]/status` | Change admin status |
| GET/POST | `/api/superadmin/roles` | List/create admin roles |
| GET/PUT/DELETE | `/api/superadmin/roles/[id]` | Manage admin role |
| GET | `/api/superadmin/audit-logs` | View admin action audit trail |
| GET | `/api/superadmin/sellers` | List all sellers |
| PATCH | `/api/superadmin/sellers/[sellerId]/status` | Force-change seller status |
| GET | `/api/superadmin/products` | All products |
| PATCH | `/api/superadmin/products/[productId]/status` | Force-change product status |

---

## 9. Frontend Structure

### Next.js App Router Layout

```
app/
├── layout.tsx               ← Root HTML shell (fonts, providers)
├── page.tsx                 ← Home page (renders HomePage component)
├── api/                     ← All API routes
├── (storefront pages)
│   ├── browse-categories/   ← /browse-categories
│   ├── category/[slug]/     ← /category/:slug
│   ├── product/[id]/        ← /product/:id
│   ├── cart/                ← /cart
│   ├── checkout/            ← /checkout
│   ├── my-orders/           ← /my-orders
│   ├── profile/             ← /profile
│   ├── wishlist/            ← /wishlist
│   ├── support-tickets/     ← /support-tickets (auth-protected, login redirect)
│   ├── login/               ← /login
│   ├── register/            ← /register
│   ├── forgot-password/     ← /forgot-password
│   ├── reset-password/      ← /reset-password
│   └── info/[slug]/         ← /info/:slug (CMS footer pages)
├── vendor/                  ← /vendor/* (seller dashboard)
└── admin/                   ← /admin/* (admin panel)
```

### Component Architecture

All page-level React components live in `src/`. The Next.js `app/` directory just imports and renders them via thin wrapper page files.

```
src/
├── app/
│   ├── App.tsx              ← Root app component
│   ├── layouts/
│   │   ├── RootLayout.tsx   ← Wraps storefront: header + footer + mobile nav
│   │   ├── AdminLayout.tsx  ← Admin panel: sidebar + header
│   │   └── SellerLayout.tsx ← Legacy seller layout
│   ├── pages/               ← All customer-facing pages
│   │   ├── LoginPage.tsx    ← Email login + Google/Facebook OAuth buttons
│   │   ├── RegisterPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   ├── OTPVerificationPage.tsx
│   │   ├── ShoppingCartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── OrderConfirmationPage.tsx
│   │   ├── OrderDetailPage.tsx
│   │   ├── MyOrdersPage.tsx
│   │   ├── MyProfilePage.tsx       ← Profile picture upload (camera icon)
│   │   ├── AddressManagementPage.tsx
│   │   ├── WishlistPage.tsx
│   │   ├── SupportTicketsPage.tsx  ← Redirects to login if not authenticated
│   │   ├── SearchResultsPage.tsx
│   │   ├── CategoryListingPage.tsx
│   │   └── admin/                  ← Admin panel pages
│   └── vendor/
│       ├── components/
│       │   ├── VendorLayout.tsx    ← Vendor sidebar + header + notification bell
│       │   ├── ProductSkuVariantRow.tsx ← Multi-image, dynamic-size variant row
│       │   └── UIComponents.tsx
│       └── pages/
│           ├── VendorDashboard.tsx
│           ├── VendorProfile.tsx   ← KYC, bank, OTP verify, custom documents
│           ├── VendorProductForm.tsx ← Create/edit product with variants
│           ├── VendorProductsList.tsx
│           ├── VendorOrdersList.tsx
│           ├── VendorOrderDetail.tsx
│           ├── VendorEarnings.tsx
│           ├── VendorPayouts.tsx
│           ├── VendorReports.tsx
│           ├── VendorNotifications.tsx
│           ├── VendorSettings.tsx
│           └── VendorSupport.tsx
├── components/              ← Shared storefront components
│   ├── Navbar.tsx           ← Top nav with search, cart, account
│   ├── Footer.tsx           ← Site footer with links
│   ├── MobileBottomNav.tsx  ← Fixed bottom nav (Home/Categories/Cart/More)
│   ├── HomePage.tsx         ← Home page content (banners, deals, categories)
│   ├── CategoryPage.tsx     ← Product grid with filters
│   ├── ProductDetailPage.tsx ← PDP with gallery, variants, sticky add-to-cart
│   ├── ProductDetailPageDynamic.tsx ← Dynamic PDP variant
│   ├── AccountLayout.tsx    ← Sidebar + content layout for account pages
│   ├── HeroBanner.tsx
│   ├── DealCards.tsx
│   ├── PromoBanners.tsx
│   ├── ProductRowSection.tsx
│   ├── CategoryNav.tsx
│   └── IndovyaparLogo.tsx   ← Brand logo (all instances link to /)
├── contexts/
│   ├── CartDrawerContext.tsx     ← Controls cart slide-out drawer
│   └── DeliveryLocationContext.tsx ← Delivery pincode state
└── lib/                     ← Business logic (see section 21)
```

---

### Key UI Patterns

**Mobile Bottom Navigation (`MobileBottomNav.tsx`)**
- Fixed at bottom, only visible on mobile (`md:hidden`)
- Tabs: Home, Categories, Cart, More
- "Orders" tab hidden for logged-out users
- "More" opens a drawer with Quick Links + Login/Logout
- Support link only appears in Quick Links when logged in
- Cart count shows real-time from API (logged-in) or localStorage (guest)

**`RootLayout.tsx`**
- Wraps all storefront pages
- Renders `<Header>`, `<Footer>`, `<MobileBottomNav>` (when `showHeaderFooter=true`)
- Footer included globally here (not in individual pages)

**Vendor Layout (`VendorLayout.tsx`)**
- Notification bell icon fetches from `/api/vendor/notifications`
- Shows unread count badge
- Dropdown panel with recent notifications
- Sidebar with navigation items

---

## 10. Vendor Onboarding Flow

```
Register → Email Verify → Profile Setup → Submit → Admin Review → Approved
```

### Status Machine

| Status | Description | What vendor can do |
|---|---|---|
| PENDING_VERIFICATION | Just registered, email not verified | Only verify email |
| DRAFT | Email verified, profile incomplete | Fill in profile, KYC, bank details |
| SUBMITTED | Profile submitted for review | Wait |
| UNDER_REVIEW | Admin is reviewing | Wait |
| APPROVED | Active vendor | List products, manage orders |
| REJECTED | Admin rejected | See reason, resubmit |
| SUSPENDED | Admin suspended | Cannot do anything |
| ON_HOLD | Temporarily held | Partial access |

### Profile Components (VendorProfile.tsx tabs)

1. **Store Info** — businessName, logo, description, website, pickup pincode
2. **KYC Details** — PAN, GST Certificate, Address Proof file uploads + "Other Documents" section for custom docs
3. **Bank Details** — bank name, account number, IFSC, account holder name
4. **Verify Contact** — OTP verification for phone and email (using `OtpVerifyField` component)
5. **Serviceable Pincodes** — add/remove delivery pincodes

### KYC Lock Rule
Once a vendor's KYC is `APPROVED` by admin, the following fields **cannot be changed**: business identity, KYC documents, bank details, categories. They can still update: store display name, logo, description, website, pickup pincode.

The API enforces this by checking and throwing `VENDOR_KYC_LOCKED_ERROR` before any update.

---

## 11. Customer Shopping Flow

```
Browse → Product Detail → Add to Cart → Checkout → Payment → Order Confirmation
```

### Browse
- Home page: hero banners, deal cards, category sections, promo banners
- Category page: product grid, filters (price range, rating, brand, pincode)
- Search: `GET /api/products?search=...&category=...&priceMin=...&priceMax=...`

### Product Detail Page
- Shows product images (with variant-specific image gallery)
- Variant selector: color chips + size buttons (with dynamic multiple sizes)
- Sticky "Add to Cart" bar at bottom on mobile
- Reviews section with rating distribution
- Q&A section

### Cart
- Guest cart stored in `localStorage`
- Logged-in cart stored in database `cart_items`
- `CartDrawerContext` controls slide-out cart drawer (accessible from anywhere)

### Checkout
- Select/add delivery address
- Apply coupon code
- Choose payment: Razorpay (card/UPI/netbanking) or COD
- Order summary with total

### Payment (Razorpay)
1. `POST /api/payments/razorpay-order` → creates Razorpay order, returns `order_id`
2. Razorpay payment modal opens in browser
3. After payment: `POST /api/payments/verify` → verifies HMAC signature, creates order in DB, clears cart

### Post-Order
- Redirect to `/order-confirmation`
- Customer can track order status on My Orders page
- Can raise support tickets linked to orders

---

## 12. Admin Panel

Path prefix: `/admin/*`. Requires `role: ADMIN` and `approvalStatus: APPROVED` and `status: ACTIVE`.

### Pages

| Page | Route | Description |
|---|---|---|
| Login | `/admin/login` | Admin authentication |
| Dashboard | `/admin/dashboard` | KPIs: orders, revenue, sellers, products |
| Analytics | `/admin/analytics` | Sales charts, top products |
| Sellers | `/admin/sellers` | Vendor list, status filters |
| Seller Detail | `/admin/sellers/[id]` | Full vendor profile, KYC docs, bank info |
| KYC Approval | `/admin/kyc-approval` | Approve/reject vendor KYC |
| Products | `/admin/products` | Moderation queue (PENDING_APPROVAL) |
| Orders | `/admin/orders` | All platform orders |
| Returns | `/admin/returns` | Return requests |
| Settlements | `/admin/settlements` | Financial settlements |
| Support Tickets | `/admin/support-tickets` | Customer tickets with reply |
| Categories | `/admin/categories` | Create/edit categories + document requirements |
| CMS Hub | `/admin/cms` | Footer pages + career openings editor |
| Delivery Areas | `/admin/delivery-areas` | Platform-wide pincode management |
| Notifications | `/admin/notifications` | Admin notifications |
| Profile Settings | `/admin/profile` | Change name, password |

### Admin RBAC
- Admins have a `role` (FK to `admin_roles`)
- Each role has a `permissions` JSON array
- Permission strings e.g. `"products:approve"`, `"sellers:block"`, `"orders:manage"`
- `isSuperAdmin: true` bypasses all permission checks
- Implemented in `src/lib/admin-rbac.ts`

---

## 13. Super Admin Panel

Separate Next.js/Express backend in `super-admin-backend/`. The main app proxies to it via `NEXT_PUBLIC_SUPER_ADMIN_API_URL`.

### Capabilities
- Create, approve, and manage Admin accounts
- Create and assign Admin Roles with granular permissions
- View audit logs of all admin actions
- Force-change seller statuses
- Force-change product statuses

### Auth
Super admin has its own JWT token (separate from main app). Stored in a different cookie. Login via `POST /api/superadmin/auth/login`.

---

## 14. Payment Flow (Razorpay)

### Configuration
```env
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxx   # Same as RAZORPAY_KEY_ID
```

### Flow
1. **Create Order**: `POST /api/payments/razorpay-order`
   - Body: `{ amount, currency, orderId? }`
   - Creates a Razorpay order via Razorpay API
   - Returns: `{ orderId, amount, currency, keyId }`

2. **Open Modal**: Frontend uses Razorpay JS SDK with the returned `orderId`

3. **Verify Payment**: `POST /api/payments/verify`
   - Body: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, cartItems, addressId, couponId? }`
   - Verifies HMAC-SHA256 signature: `HMAC(razorpay_order_id + "|" + razorpay_payment_id, KEY_SECRET)`
   - If valid: creates `Order`, creates `OrderItems` per seller, creates `Payment` record, clears cart
   - Returns: `{ orderId }` for redirect to `/order-confirmation`

---

## 15. Email & SMS Services

### Email (`src/lib/email/`)

**Provider**: SMTP (Nodemailer). Recommended provider: Brevo (smtp-relay.brevo.com port 587).

**Templates:**
- `customer-verification.ts` — welcome + email verify link
- `customer-password-reset.ts` — forgot password link
- `vendor-verification.ts` — vendor welcome + email verify link
- `vendor-password-reset.ts` — vendor forgot password link

All templates send HTML emails. The `send.ts` module creates the Nodemailer transporter from env vars.

**Link base URL priority** (email links): `EMAIL_APP_URL` → `NEXT_PUBLIC_APP_URL` → `APP_URL`

---

### SMS (`src/lib/sms/`)

**Provider**: AWS SNS (Simple Notification Service).

**Used for**: Customer phone OTP login.

**Configuration:**
```env
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

**IAM requirement**: The IAM user needs `sns:Publish` permission.

**Sandbox note**: New AWS accounts are in SMS Sandbox — must verify destination numbers or request sandbox exit for production.

**`send-login-otp.ts`**: Generates a 6-digit OTP, sends via SNS, returns the OTP for hashing and storage.

---

## 16. File Upload System

**Storage**: Local filesystem at `public/uploads/` (served via `/api/uploads/[[...path]]`).

**Upload directories (`src/lib/uploads/storage.ts`):**
- `public/uploads/products/` — product images
- `public/uploads/kyc/` — vendor KYC documents
- `public/uploads/vendor-docs/` — vendor custom documents
- `public/uploads/avatars/` — customer profile pictures

**Upload endpoints:**
- `POST /api/vendor/upload` — generic product image upload (vendor only)
- `POST /api/vendor/profile/documents` — KYC document upload (multipart)
- `POST /api/vendor/profile/vendor-documents` — custom vendor document upload
- `POST /api/auth/me/avatar` — customer avatar upload

**Avatar upload rules:**
- Allowed types: JPEG, PNG, WebP, GIF
- Max size: 5 MB
- Filename: `avatar-{userId}-{uuid}.{ext}`
- Stored in `public/uploads/avatars/`
- URL saved to `users.avatar_url`

**File serving**: `/api/uploads/[[...path]]` streams files from `public/uploads/` with content-type detection.

---

## 17. Notification System

The `notifications` table is **polymorphic** — a notification can be for a customer (`userId`), vendor (`sellerId`), or admin (`adminId`).

### Vendor Notifications
- **Bell icon** in `VendorLayout.tsx` shows unread count badge
- Fetches from `GET /api/vendor/notifications`
- Dropdown panel shows last 20 notifications
- `PATCH /api/vendor/notifications` — mark all as read
- `PATCH /api/vendor/notifications/[id]` — mark single as read
- Full notifications page at `/vendor/notifications`

### Fields
- `type`: SYSTEM / ORDER / SELLER / PAYMENT / RETURN
- `title`, `message`
- `read`, `readAt`
- Soft deletable

---

## 18. Delivery / Pincode System

The system supports **three levels** of delivery restriction:

### Level 1: Platform-wide (Admin)
- `platform_delivery_config.restrictDeliveryToPincodes` — toggle
- When `true`: only pincodes in `platform_serviceable_pincodes` are serviceable
- Managed via `GET/PATCH /api/admin/platform/service-pincodes`

### Level 2: Per-Seller (Vendor)
- `seller.restrictDeliveryToPincodes` — toggle in vendor profile
- When `true`: only pincodes in `seller_serviceable_pincodes` for that seller are serviceable
- Managed via `/api/vendor/service-pincodes`

### Level 3: Product Delivery Check
- `GET /api/products/[id]/delivery-eligibility?pincode=XXXXXX`
- Checks platform config + seller config in order
- Frontend shows "Delivery available" / "Not deliverable to this pincode" on PDP

### Pincode stored in context
`DeliveryLocationContext.tsx` — stores user's entered pincode in state + localStorage for use across pages.

---

## 19. CMS & Footer Pages

### Footer Pages
- Admin creates pages via `/admin/cms` → `/api/admin/cms/footer-pages`
- Each page has: `slug` (URL), `sectionId` (groups links in footer), `title`, `content` (trusted HTML)
- Public access: `GET /api/cms/footer-pages/[slug]` → rendered at `/info/[slug]`
- `cms-content-render.ts` handles sanitizing/rendering the content

### Career Openings
- Admin creates job listings via `/admin/cms`
- `GET /api/careers/openings` → returns `published: true` openings sorted by `sortOrder`
- Rendered at `/info/careers` (`CareersPage.tsx`)

### Footer Structure
`Footer.tsx` fetches footer sections/pages from CMS and renders them grouped by `sectionId`.

---

## 20. Guest Cart System

**File**: `src/lib/guest-cart.ts`

- Stored in `localStorage` under key `indovyapar_guest_cart`
- Format: array of `{ productId, variantKey, quantity }`
- `subscribeToGuestCartChanges(callback)` — event-based updates for cart count
- `getGuestCartCount()` — total item count
- On login: guest cart is merged with server cart

`MobileBottomNav.tsx` shows real-time cart count:
- Logged in → fetch from `/api/cart/items`
- Guest → `getGuestCartCount()` from localStorage
- Updates on `indovyapar-cart-updated` window event

---

## 21. Utility Libraries

### `src/lib/api/` — API Infrastructure
- `handler.ts` — `withApiHandler()` wrapper, `ApiRouteError` class, error mapping
- `response.ts` — `apiSuccess()`, `apiError()`, `apiNotFound()`, `apiBadRequest()`, `apiUnauthorized()`, `apiForbidden()`, `apiInternalError()`
- `types.ts` — `ApiSuccessResponse`, `ApiErrorResponse`, `ApiMeta`, type guards
- `status.ts` — HTTP status code constants

### `src/lib/auth/` — Authentication
- `jwt.ts` — `signToken()`, `verifyToken()` using `jose` / HMAC-SHA256
- `session.ts` — `getSession()`, `requireSession()`
- `cookies.ts` — `setAuthCookie()`, `clearAuthCookie()`
- `password.ts` — `hashPassword()`, `verifyPassword()` using bcrypt
- `oauth.ts` — Google/Facebook OAuth: auth URL generation, code exchange, CSRF state
- `phone.ts` — phone number normalization
- `phone-otp-hash.ts` — HMAC hash for OTP codes
- `middleware-auth.ts` — JWT verification for Edge middleware
- `middleware-routes.ts` — route protection rules (which paths need which roles)
- `validation.ts` — Zod schemas for auth payloads
- `vendor-approval.ts` — vendor status transition logic

### `src/lib/data/` — Database Query Layer
- `products.ts` — product search, filtering, detail
- `cart.ts` — cart CRUD
- `vendor-profile.ts` — vendor profile, KYC, bank, documents, `deleteVendorDocument()`
- `vendor-products.ts` — vendor product CRUD
- `vendor-orders.ts` — vendor order queries
- `vendor-dashboard.ts` — dashboard stats
- `vendor-earnings.ts` — earnings calculations
- `vendor-payouts.ts` — payout history
- `vendor-reports.ts` — summary reports
- `vendor-support.ts` — vendor support tickets
- `categories.ts` — category + subcategory queries
- `customer-support.ts` — customer ticket queries
- `support-ticket-customer-read.ts` — read-optimized ticket queries
- `wishlist.ts` — wishlist CRUD
- `pincode-bulk.ts` — bulk pincode import
- `platform-service-pincodes.ts` — platform pincode management
- `seller-service-pincodes.ts` — seller pincode management
- `product-pin-filter.ts` — delivery eligibility logic

### `src/lib/validation/schemas.ts`
Zod schemas for all API input validation including vendor profile, product creation, SKU variants.

### `src/lib/product-sku-variant.ts`
- Helpers for the `ProductVariant` model
- Supports multiple images per variant (stored as JSON array in `images` field)
- Supports dynamic multiple sizes (stored in `size` field)
- `groupVariantsByColor()` — groups flat DB rows by color for the UI

### `src/lib/razorpay.ts`
Razorpay SDK initialization and helper functions.

### `src/lib/guest-cart.ts`
Guest cart localStorage management.

### `src/lib/recently-viewed.ts`
Recently viewed products stored in localStorage.

### `src/lib/admin-rbac.ts`
Admin role-based access control. `hasPermission(admin, permission)`.

### `src/lib/prisma.ts`
Singleton Prisma client instance (prevents connection pool exhaustion in dev).

### `src/lib/hooks/`
- `useApi.ts` — generic data fetching hook with loading/error states
- `useAuthSession.ts` — client-side session check hook

---

## 22. Deployment (AWS Lightsail)

**Server**: Amazon Lightsail Node.js instance (IP: 172.26.0.142 / 15.206.19.156).
**Process Manager**: PM2.

### PM2 Config (`ecosystem.config.cjs`)
```js
module.exports = {
  apps: [{
    name: "ecomm",
    script: "app.js",
    cwd: "/home/bitnami/projects/ecomm-multi-vendor",
    env: { NODE_ENV: "production" },
    max_memory_restart: "800M"
  }]
};
```

### App Entry Point (`app.js`)
- Loads `.env` file manually (Next.js doesn't do this for `node app.js`)
- Reads `PORT` from env (required, no default)
- Spawns `npx next start -H 0.0.0.0 -p $PORT`
- Falls back to `dev` mode if no build exists

### Deploy Script (`~/deploy.sh`)
```bash
#!/bin/bash
set -e
cd ~/projects/ecomm-multi-vendor
git pull origin lakshya/cart-page
npm install --omit=dev
npx prisma migrate deploy
NODE_OPTIONS="--max-old-space-size=1400" npm run build
pm2 reload ecomm --update-env
pm2 status
```

### Build Memory Management
Lightsail instances have cgroup memory limits. Next.js build needs 1.4–2GB RAM.
- `NODE_OPTIONS="--max-old-space-size=1400"` caps Node.js heap
- 4GB swap file is configured on the server
- `next.config` optionally has `swcMinify: false` to reduce peak RAM

### Git Branch
Production branch: `lakshya/cart-page`

### Common Server Commands
```bash
pm2 status                          # Check app health
pm2 logs ecomm --lines 50           # View recent logs
pm2 restart ecomm                   # Restart
pm2 reload ecomm --update-env       # Zero-downtime reload
npx prisma migrate deploy           # Apply pending migrations
NODE_OPTIONS="--max-old-space-size=1400" npm run build  # Build
```

---

## Appendix A — Database Migrations

Migrations are in `prisma/migrations/` with timestamp-prefixed folders.

| Migration | Description |
|---|---|
| `20260225135503_init` | Initial schema (all base tables) |
| `20260226000000_add_seller_profile_extras` | Seller profile extras JSON |
| `20260226100000_add_vendor_support_tickets` | Vendor support tickets table |
| `20260226101509_add_seller_profile_extras` | Seller profile extras iteration |
| `20260226120000_add_seller_password_reset` | Password reset for sellers |
| `20260227120000_add_vendor_email_verification` | Email verification for vendors |
| `20260228000000_seller_status_reason_and_dynamic_kyc` | Seller status reason field + dynamic KYC |
| `20260304000000_add_admin_phone` | Phone field for admins |
| `20260312000000_add_product_rejection_reason` | Product rejection reason field |
| `20260312100000_add_vendor_ticket_admin_reply` | Admin reply on vendor tickets |
| `20260317000000_super_admin_roles_audit` | Super admin roles + audit logs |
| `20260324120000_customer_phone_otp_login` | Customer phone OTP table |
| `20260324140000_add_cms_footer_pages` | CMS footer pages table |
| `20260325120000_customer_support_ticket_admin_reply` | Admin reply on customer tickets |
| `20260325180000_seller_serviceable_pincodes` | Per-seller delivery pincodes |
| `20260325193000_seller_restrict_delivery_to_pincodes` | Seller delivery restriction flag |
| `20260325210000_platform_delivery_areas` | Platform-wide delivery config |
| `20260326120000_add_user_email_verification` | Email verification for customers |
| `20260331120000_career_openings` | Career openings table |
| `20260331120001_career_opening_description` | Description field for career openings |
| `20260402120000_user_password_reset` | Password reset for customers |
| `20260430120000_product_variants` | Product variants table (SKU-level) |
| `20260430130000_product_variant_images` | `images` JSON field on product_variants |
| `20260430150000_seller_otp_verification` | Phone/email OTP fields on sellers |
| `20260430160000_user_oauth_fields` | OAuth fields + nullable password_hash on users |

---

## Appendix B — Key Business Rules

1. **Vendor products are hidden until APPROVED** — `status: DRAFT/PENDING_APPROVAL/REJECTED/INACTIVE` products don't show in storefront.
2. **Vendor must be APPROVED** to list active products. Products from SUSPENDED/ON_HOLD vendors are hidden.
3. **Orders fan out to sellers** — one customer order creates multiple `order_items`, each assigned to its seller. Sellers only see their own items.
4. **Commission is tracked per order item** — `commissionPercent`, `commissionAmount`, `netPayable` on `order_items`.
5. **Soft deletes everywhere** — `deletedAt IS NULL` filters must be applied to almost all queries.
6. **KYC lock** — once KYC is approved, identity/docs/bank/categories are immutable via API.
7. **OAuth users have no password** — `passwordHash` is null. These users cannot use the "Change Password" endpoint and get a helpful error message.
8. **Vendor OTP verification** is separate from customer OTP login — different storage (on `Seller` record vs `customer_phone_otps` table) and different purpose (profile verification vs login).
9. **Support tickets are auth-gated on mobile** — `SupportTicketsPage` redirects to `/login?returnUrl=/support-tickets` if not authenticated. The mobile nav's "Support" link only appears when logged in.
10. **Cart merges on login** — guest cart items (localStorage) merge with server cart on successful login.

---

*End of documentation. Last updated: April 2026.*
