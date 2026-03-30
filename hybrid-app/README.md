# Hybrid App (Mobile-First From Scratch)

This folder contains a brand-new mobile-first UI scaffold designed from scratch for a hybrid/webview app experience.

## Included pages

- `pages/HomePage.tsx`
- `pages/ProductDetailPage.tsx`
- `pages/LoginPage.tsx`
- `pages/RegisterPage.tsx`
- `pages/ProfilePage.tsx`
- `pages/MyOrdersPage.tsx`
- `pages/OrderDetailPage.tsx`
- `pages/WishlistPage.tsx`
- `pages/CartPage.tsx`
- `pages/CheckoutPage.tsx`
- `pages/AddressManagementPage.tsx`
- `pages/SupportTicketsPage.tsx`

## Shared components

- `components/MobileAppShell.tsx` (header + bottom tabs + mobile spacing)
- `components/GlassCard.tsx` (premium/glassy card surface)

## Notes

- These components are intentionally isolated from existing app routes for clean incremental adoption.
- They can be wired into `app/(main)` routes one-by-one after review.
