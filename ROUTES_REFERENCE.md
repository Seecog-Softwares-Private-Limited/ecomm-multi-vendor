# MarketHub - Complete Routes Reference

## 🏠 Customer E-Commerce Routes (14 Pages)

| # | Page Name | Route | Description |
|---|-----------|-------|-------------|
| 1 | Homepage | `/` | Main landing page with categories, featured products, banners |
| 2 | Login | `/login` | Customer login with email/password and OTP option |
| 3 | Register | `/register` | New customer registration form |
| 4 | OTP Verification | `/otp-verification` | 6-digit OTP input verification |
| 5 | Forgot Password | `/forgot-password` | Password reset email request |
| 6 | Reset Password | `/reset-password` | New password creation form |
| 7 | Category Listing | `/category/:categoryName` | Product listing by category with filters |
| 8 | Sub-Category | `/category/:categoryName/:subCategoryName` | Sub-category product listing |
| 9 | Search Results | `/search` | Product search results page |
| 10 | Product Detail | `/product/:productId` | Individual product details page |
| 11 | Shopping Cart | `/cart` | Cart items with quantity controls |
| 12 | Checkout | `/checkout` | Checkout with address and payment selection |
| 13 | Add Address | `/add-address` | New shipping address form |
| 14 | Order Confirmation | `/order-confirmation` | Order success confirmation page |

---

## 🔐 Admin Dashboard Routes (14 Pages)

| # | Page Name | Route | Description |
|---|-----------|-------|-------------|
| 15 | Admin Login | `/admin/login` | Admin authentication page |
| 16 | Dashboard | `/admin` | Main admin dashboard with stats and charts |
| 17 | Seller Management | `/admin/sellers` | List and manage all sellers |
| 18 | Seller Detail | `/admin/sellers/:sellerId` | Individual seller profile with tabs |
| 19 | KYC Approval | `/admin/kyc/:sellerId` | Review and approve seller KYC documents |
| 20 | Categories | `/admin/categories` | Manage product categories |
| 21 | Product Moderation | `/admin/products` | Review and approve product listings |
| 22 | Orders Management | `/admin/orders` | View and manage all orders |
| 23 | Order Detail | `/admin/orders/:orderId` | Individual order details and timeline |
| 24 | Returns & Refunds | `/admin/returns` | Process return requests and refunds |
| 25 | Settlements | `/admin/settlements` | Track commission and seller payouts |
| 26 | Sales Analytics | `/admin/analytics` | Revenue charts and top performers |
| 27 | Notifications | `/admin/notifications` | System notifications management |
| 28 | Profile Settings | `/admin/settings` | Admin account settings and permissions |

---

## 📄 Special Routes

| Page | Route | Description |
|------|-------|-------------|
| **PDF Export** | `/pdf-export` | Export all 28 pages to printable PDF |

---

## 🎨 Design System

All pages follow a consistent **low-fidelity wireframe** design:

### Color Scheme
- Background: `#F3F4F6` (gray-100)
- Cards/Containers: `#FFFFFF` (white)
- Borders: `#9CA3AF` (gray-400) - **2px bold**
- Text Primary: `#111827` (gray-900)
- Text Secondary: `#4B5563` (gray-700)
- Accents: `#374151` (gray-700) for buttons

### Typography
- Headings: Bold, uppercase labels
- Body: Regular weight, clear hierarchy
- All text: Grayscale only

### Components
- **Borders**: 2px solid borders on all elements
- **Buttons**: Gray background with darker border
- **Forms**: Gray-100 background with gray-400 borders
- **Tables**: Alternating row colors, bold headers
- **Cards**: White background with gray borders
- **Images**: Gray placeholders with "IMAGE" text

### Layout
- Max width: 1440px for customer pages
- Full width for admin pages
- Consistent spacing: 8px base unit
- Grid layouts: 2, 3, or 4 columns

---

## 🚀 Quick Navigation

### From Homepage:
- Blue banner at top has links to:
  - Admin Login
  - Admin Dashboard  
  - **PDF Export** ← Click here!

### Testing Routes:
All routes are configured and ready to use. Simply navigate to any URL above.

---

## 📊 Page Count Summary

| Section | Pages | Routes |
|---------|-------|--------|
| Customer E-Commerce | 14 | Public routes |
| Admin Dashboard | 14 | Admin-protected routes |
| **Total Application** | **28** | **29 routes** (including PDF export) |

---

## 🔑 Quick Access Links for Development

Copy and paste these URLs for quick testing:

### Customer Pages
```
http://localhost:5173/
http://localhost:5173/login
http://localhost:5173/register
http://localhost:5173/cart
http://localhost:5173/checkout
```

### Admin Pages
```
http://localhost:5173/admin/login
http://localhost:5173/admin
http://localhost:5173/admin/sellers
http://localhost:5173/admin/orders
http://localhost:5173/admin/analytics
```

### PDF Export
```
http://localhost:5173/pdf-export
```

---

**Last Updated**: February 20, 2026
