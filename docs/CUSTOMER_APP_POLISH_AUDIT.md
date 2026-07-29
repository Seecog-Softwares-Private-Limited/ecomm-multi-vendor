# IndoVyapar Customer App — Production Polish Audit Report

**Date:** July 2026  
**Scope:** Frontend quality only (no API, auth, routing, database, or business-logic changes)

---

## ✔ Issues Fixed

### Design consistency
- Added **`src/styles/customer.css`** with shared design tokens: brand colors, page background, card radius (16px), control radius (12px), touch-min (44px), motion durations, and utility classes (`iv-page`, `iv-card`, `iv-btn-*`, `iv-chip`, `iv-badge`, `iv-section-title`).
- Aligned **AccountLayout** with tokens: `iv-page-account`, `iv-card` sidebar/tabs, brand CSS variables, 44px touch targets on nav links.
- **RootLayout** now uses `--iv-page-bg` for consistent page background across customer surfaces.

### Animation consistency
- Consolidated duplicate keyframes (`product-card-in`, `home-section-in`, `wishlist-card-in`) into a single **`iv-enter-up`** animation in `app/globals.css`.
- **ProductCard**, **WishlistCard**, and home sections use shared classes (`product-card-enter`, `iv-enter`, `home-section-enter`).
- Removed inline `<style jsx global>` from **WishlistPage**.
- Added **`prefers-reduced-motion`** guard to disable entrance animations when requested.

### Error states
- Added reusable **`CustomerErrorState`** component with retry, Continue Shopping, and optional secondary navigation.
- Applied to: **Wishlist**, **My Orders**, **My Profile**, **Search Results**, **Address Management**.

### Accessibility
- Increased wishlist icon/remove buttons on **ProductCard** and **WishlistCard** to **44×44px** minimum touch targets.
- Account mobile tab nav receives **`aria-label="Account sections"`** and visible focus rings via brand ring token.

### Loading / UX
- Search route already wrapped in **Suspense + skeleton** (prior work).
- Home, Search, Profile, Wishlist, Orders retain skeleton loaders (prior work).
- **`color-scheme: light`** set on customer tokens to prevent OS dark-mode form/control glitches until full dark theme ships.

### Code quality
- Removed duplicate animation definitions from **WishlistPage**.
- Centralized customer utilities in one CSS module imported from **`app/globals.css`**.

---

## ⚠ Remaining Issues

### Dark mode (Section 3)
- Customer app is **light-mode only**. `.dark` tokens exist in `theme.css` but no `ThemeProvider` or `.dark` class is applied to customer routes.
- **All listed pages** (Home, Search, Categories, PDP, Wishlist, Cart, Checkout, Orders, Profile, Support, Settings) need a dedicated dark palette pass before launch.
- Hardcoded brand hex (`#FF6A00`, `#E55F00`) still appears in many components outside the new token utilities.

### Design consistency (Section 1)
- Most pages still use **inline Tailwind** rather than `iv-*` utilities — tokens are available but not fully adopted.
- **Three home implementations** remain (`/`, `/home`, `/home-enhanced`); only `/` is production-quality.
- shadcn **Button** component is unused in customer UI; CTA styles are duplicated as class strings.

### Responsive (Section 2)
- No automated viewport tests at 320 / 360 / 390 / 412 / 768 / 1024px.
- **ProductDetailPage** and **CheckoutPage** use heavy inline styles; narrow-width overflow not fully verified.
- **Cart** sticky checkout bar and **Checkout** form fields need manual QA on 320px devices.

### Loading experience (Section 4)
- **Address Management**, **Order Detail**, **Track Order**, **Order Confirmation** still show text-only loading (“Loading…”) instead of skeletons.
- **Cart** and **Checkout** lack dedicated skeleton states on initial load.

### Error states (Section 5)
- **Order Detail**, **Track Order**, **Order Confirmation**, **Support Tickets**, **Cart**, and **Checkout** still use bespoke or toast-only error handling.
- HTTP status-specific copy (401 / 404 / 500 / timeout) is not differentiated consistently.

### Accessibility (Section 6)
- Full **ARIA / keyboard / focus-order** audit not completed page-by-page.
- Many icon-only buttons outside updated cards may still be under 44px.
- **Login / Register / Checkout** forms need systematic autofocus and error announcement review.

### Performance (Section 8)
- **React.memo / useMemo / useCallback** applied on key listing components (prior work) but not audited on Cart, Checkout, PDP gallery.
- No bundle-splitting changes in this pass.
- **Infinite scroll** on Search is implemented; Category pages may still load full grids.

### Forms (Section 9)
- Auth and checkout forms have validation but inconsistent loading-button and disabled-state patterns.
- **Support ticket** create form error UX differs from listing error UX.

### Mobile UX (Section 11)
- Safe-area padding exists on **RootLayout** bottom nav; keyboard overlap on checkout/address modals not verified.
- Pull-to-refresh on Home and Orders; not on Wishlist or Profile.

### Code cleanup (Section 12)
- Legacy files **`src/styles/index.css`**, **`src/styles/tailwind.css`** may still be unused.
- Duplicate home page components remain.

---

## 💡 Recommended Future Improvements

1. **ThemeProvider + dark mode** — Map `--iv-brand`, surfaces, shadows, and chip/badge colors under `.dark`; audit contrast on every customer route.
2. **Migrate CTAs to `iv-btn-*`** — Replace hardcoded `#FF6A00` strings across ~50+ files incrementally.
3. **CustomerPageContainer adoption** — Wrap Home, Search, Category, Cart, Checkout for unified max-width and padding.
4. **Skeleton library** — Add `AddressSkeleton`, `OrderDetailSkeleton`, `CartSkeleton`, `CheckoutSkeleton`.
5. **CustomerErrorState everywhere** — Wire remaining async pages; add status-aware messages (401 → login prompt, 404 → not found).
6. **Viewport regression suite** — Playwright snapshots at 320–1024px for top 10 routes.
7. **Consolidate home routes** — Redirect `/home` and retire `/home-enhanced` mock.
8. **Performance pass** — Memoize Cart line items, lazy-load PDP gallery thumbs, audit Search filter re-renders.
9. **Form primitives** — Shared `FormField`, `LoadingButton`, `FormError` for auth/checkout/profile/support.
10. **Remove dead CSS** — Delete unused style entry points after confirming no admin/vendor imports.

---

## Files Changed (This Pass)

| File | Change |
|------|--------|
| `src/styles/customer.css` | New design tokens & utilities |
| `app/globals.css` | Import customer.css; unified animations; reduced-motion |
| `src/components/ui-customer/CustomerErrorState.tsx` | New shared error UI |
| `src/components/ui-customer/CustomerPageContainer.tsx` | New page wrapper (ready for adoption) |
| `src/components/AccountLayout.tsx` | Token alignment, a11y touch targets |
| `src/app/layouts/RootLayout.tsx` | Page background token |
| `src/components/product/ProductCard.tsx` | Unified animation; 44px wishlist button |
| `src/components/wishlist/WishlistCard.tsx` | Unified animation; 44px remove button |
| `src/app/pages/WishlistPage.tsx` | CustomerErrorState; iv-card; removed duplicate CSS |
| `src/app/pages/MyOrdersPage.tsx` | CustomerErrorState |
| `src/app/pages/MyProfilePage.tsx` | CustomerErrorState |
| `src/app/pages/SearchResultsPage.tsx` | CustomerErrorState |
| `src/app/pages/AddressManagementPage.tsx` | CustomerErrorState |

---

## Build Status

`npm run build` — **passes** after this polish pass.
