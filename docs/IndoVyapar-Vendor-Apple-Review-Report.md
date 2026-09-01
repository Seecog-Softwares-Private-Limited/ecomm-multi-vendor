# IndoVyapar Vendor — Apple App Store Review History & Fixes

**Document date:** August 29, 2026  
**App:** IndoVyapar Vendor (Expo / React Native WebView hybrid)  
**Bundle ID:** `com.blablabla0978.vendorapp`  
**Current version in repo:** 1.0.0 (build 8)  
**Production web:** https://indovyapar.com/vendor?app=1  

---

## 1. Repository branches (as of Aug 29, 2026)

| Branch | Remote | Status / notes |
|--------|--------|----------------|
| **main** | `origin/main` | Production deploy target. Matches latest merged vendor/iOS fixes. |
| **vinik** | `origin/vinik` | Active development branch. **In sync with origin/main** (0 commits ahead/behind). |
| **Sumit** | `origin/Sumit` | Feature branch (merged via PRs #117–#125). Apple Sign In, Guideline 4.8, OAuth fixes. |
| **lakshya/cart-page** | `origin/lakshya/cart-page` | Customer cart work (older). |
| **lakshya/vendor-page** | `origin/lakshya/vendor-page` | Vendor page work. |
| **optimizations-ba** | `origin/optimizations-ba` | Performance optimizations. |

**Local `main` is behind `origin/main`.** Use `origin/main` or `vinik` for the latest App Review fixes.

---

## 2. Review timeline summary

| # | Date | Version | Device | Submission ID | Outcome |
|---|------|---------|--------|---------------|---------|
| 1 | Aug 12, 2026 | 1.0.0 (1) | iPad Air 11" (M3) | `95da6c67-c2d7-41d4-94ec-9802b9dfbc71` | **Rejected** — 4 issues |
| 2 | Aug 26, 2026 | 1.0.0 (5) | iPhone 17 Pro Max | `29e64607-cc54-4454-86e4-e681ef44baa1` | **Rejected** — Guideline 4 + 4.8 (auth still broken) |

---

## 3. Rejection #1 — Version 1.0.0 (1) — Aug 12, 2026

**Review device:** iPad Air 11-inch (M3), iPadOS 26.6  
**Submission ID:** `95da6c67-c2d7-41d4-94ec-9802b9dfbc71`

### 3.1 Guideline 2.3.8 — Placeholder app icons

**Apple said:** App icons appear to be placeholder icons (default Expo/React logo).

**Root cause:** `vendor-app/assets/images/icon.png` was the default Expo template icon, not the IndoVyapar brand.

**Fix implemented:**
- Replaced icon with real IndoVyapar Vendor brand asset (1024×1024 RGB PNG).
- Updated `vendor-app/app.json` icon, splash, and Android adaptive icon.
- Rebuilt IPA; verified icon accepted by Transporter (no “Invalid large app icon” error).

**Key files:** `vendor-app/assets/images/icon.png`, `vendor-app/app.json`  
**Commits:** `4cbd927e` (original logo), icon fixes in vendor-app PRs

---

### 3.2 Guideline 2.3.3 — iPad screenshots (login only)

**Apple said:** 13-inch iPad screenshots only show the login screen. Screenshots must highlight core app functionality.

**Root cause:** App Store Connect metadata had login-only iPad screenshots.

**Fix implemented:**
- Captured logged-in iPad screenshots: Dashboard, Orders, Products, Earnings, Payouts.
- Login screenshot placed **last** in the set (Apple discourages login-first metadata).
- Exported at required sizes: **2064×2752** and **2048×2732** (13" iPad class).
- Also prepared iPhone 6.5" / 6.9" sizes (1242×2688, 1284×2778, 1290×2796, 1320×2868).

**Key files:** `vendor-app/assets/app-store-screenshots/`  
**Folder:** `/Users/vinikdhariwal/Downloads/IndoVyapar-AppStore-Screenshots/`

---

### 3.3 Guideline 4.8 — Sign in with Apple missing

**Apple said:** App uses Google (third-party login) but does not offer an equivalent login that meets 4.8 requirements (limited data, private email, no ad tracking). Sign in with Apple satisfies this.

**Root cause:** Vendor login had Google OAuth only; no native Sign in with Apple.

**Fix implemented:**
- Added **Sign in with Apple** on vendor login (iOS only).
- Native path: `expo-apple-authentication` in `vendor-app/App.js`.
- Web UI: “Continue with Apple” button on `VendorLoginPage.tsx` (shown above Google on iOS).
- Backend: `POST /api/auth/vendor-apple` with Apple identity token verification.
- Entitlements: `usesAppleSignIn: true`, `com.apple.developer.applesignin` in `app.json`.
- Fixed Apple nonce handling (`7e489e7f` — fix apple login nonce).

**Key files:**
- `vendor-app/App.js` — native Apple auth bridge
- `src/app/pages/vendor/VendorLoginPage.tsx`
- `app/api/auth/vendor-apple/route.ts`
- `src/lib/auth/apple.ts`

**Commits:** `f6616364` (add apple sign in), `7e489e7f`, `c66c4d2b` (fix guideline 4.8)

---

### 3.4 Guideline 2.1(a) — Camera crash on iPad

**Apple said:** App crashed when reviewer used camera to add a product image.

**Steps:** Vendor app → Add/Edit product → Upload image → Camera (iPad).

**Root cause:**
1. **Missing iOS privacy strings** — no `NSCameraUsageDescription` / `NSPhotoLibraryUsageDescription` in Info.plist → iOS terminates app when camera opens.
2. **Hidden file input** — `<input type="file" className="hidden">` breaks iPad popover anchor for camera picker.
3. **Wrong WebView user agent** — Android Chrome UA forced on iOS, breaking native file/camera behavior.

**Fix implemented:**
- Added to `vendor-app/app.json` → `ios.infoPlist`:
  - `NSCameraUsageDescription`
  - `NSPhotoLibraryUsageDescription`
  - `NSMicrophoneUsageDescription`
- Fixed file upload component: off-screen positioned input instead of `display:none` (`UIComponents.tsx`).
- Platform-specific WebView user agents (iPhone / iPad / Android) in `App.js`.
- Tested camera + photo library on iPad.

**Key files:**
- `vendor-app/app.json`
- `vendor-app/App.js`
- `src/app/vendor/components/UIComponents.tsx`

**Commits:** `43f2c73e` (Camera Error Fix), `3cabace4` (fix guideline 2.1.a)

---

## 4. Rejection #2 — Version 1.0.0 (5) — Aug 26, 2026

**Review device:** iPhone 17 Pro Max  
**Submission ID:** `29e64607-cc54-4454-86e4-e681ef44baa1`

### 4.1 Guideline 4 — External Safari for sign-in

**Apple said:** User is taken to the **default web browser** (Safari) to sign in or register. Auth must happen in-app (or via Safari View Controller / ASWebAuthenticationSession).

**Evidence from review:** Screenshot showed Google OAuth opening in Safari with URL bar (`accounts.google.com`), not in-app.

**Root cause:**
- `startVendorOAuthLogin()` posted `OPEN_EXTERNAL_BROWSER` to native shell.
- `vendor-app/App.js` called `Linking.openURL()` → system Safari.
- Customer `/login` reachable from vendor app (“Are you a customer?” link) with Google-only login.

**Fix implemented:**
- **Removed Safari handoff:** Vendor Google OAuth uses `window.location.assign()` only in WebView (`start-oauth.ts`).
- **Blocked external browser opens** for auth URLs in `App.js` (`shouldBlockExternalBrowserOpen`).
- **Hidden customer login** when `app=1` / app mode on vendor auth pages.
- **Redirect customer auth routes** (`/login`, `/register`, etc.) back to `/vendor/login` in WebView + middleware.
- **Google OAuth redirect_uri fix:** Vendor login now uses shared registered URI `/api/auth/oauth/google/callback` (fixes `redirect_uri_mismatch`).
- **Google account picker:** OAuth opens via `WebBrowser.openAuthSessionAsync` (ASWebAuthenticationSession) so saved Google accounts appear; callback returns to WebView with session cookie.
- **SPA guards:** Injected script blocks client-side navigation to customer auth routes.

**Key files:**
- `src/lib/auth/start-oauth.ts`
- `vendor-app/App.js`
- `src/app/pages/vendor/VendorLoginPage.tsx`
- `src/app/pages/LoginPage.tsx`, `RegisterPage.tsx`, `ForgotPasswordPage.tsx`
- `middleware.ts`
- `src/contexts/AppModeContext.tsx`
- `app/api/auth/oauth/[provider]/callback/route.ts`
- `src/lib/auth/complete-vendor-google-oauth.ts`

**Commits:** `9b2ca417` (BrowserRedirect Fix), `7bfb0347` (iOS App Fix), PRs #121–#125

---

### 4.2 Guideline 4.8 — Sign in with Apple still not acceptable

**Apple said:** Third-party login (Google) without equivalent Sign in with Apple option meeting 4.8 requirements.

**Evidence from review:** Customer Sign In screen (`/login`) with Google only — reachable from vendor app.

**Additional issue reported:** Apple sign-in stuck on loading spinner on Android.

**Root cause:**
- Customer login page exposed in vendor WebView.
- Apple button gated incorrectly; spinner had no timeout on Android.
- Google could appear before Apple on first paint (4.8 violation).

**Fix implemented:**
- **Sign in with Apple iOS-only:** Button hidden on Android; no infinite spinner.
- **45-second timeout** on Apple auth with user-visible error.
- **Never show Google alone on iOS** — wait for Apple capability before showing social buttons.
- **Block customer `/login`** entirely in vendor app mode (redirect + WebView intercept).
- **Account deletion** in Settings (Guideline 5.1.1 / 4 account deletion requirement): Settings → Delete Account.

**Key files:** Same as 4.1 + `VendorSettings.tsx`, `app/api/vendor/me/route.ts` (DELETE)

**Commits:** `c66c4d2b`, `1992a953` (add delete account), auth hardening commits

---

## 5. Additional hardening (Guideline 2.1 — incomplete functionality)

Apple rejects apps with fake or non-functional UI. These were fixed proactively:

| Issue | Fix |
|-------|-----|
| Fake “Live Chat” / placeholder phone on Support | Removed; real email + support ticket form only |
| Fake Cancel Order / Report Issue modals | Removed; “Contact Support” routes to `/vendor/support?orderId=…` |
| Demo “Tech Store India” in Settings | Removed; wired real profile/password APIs |
| Non-functional “Remember me” checkbox | Removed from vendor login |
| Document “Open in new tab” in app | Opens in WebView, not Safari |
| Missing Privacy Policy / Terms links | Added in Settings + vendor login footer |
| Settings Notifications tab (fake) | Removed |

**Key files:** `VendorSupport.tsx`, `VendorOrderDetail.tsx`, `VendorSettings.tsx`, `DocumentPreviewOverlay.tsx`

---

## 6. Android-specific OAuth fix (Aug 29, 2026)

**Issue:** “Missing OAuth state” when Google login used Chrome Custom Tabs on Android (separate cookie store from WebView).

**Fix:** HMAC-signed OAuth state so callback validates without relying on `oauth_state` cookie when WebView and CCT use separate stores.

**Commit:** `a6f9ac37` — Fix vendor Google OAuth Missing OAuth state on Android WebView

---

## 7. Build history (iOS)

| Build | Notes |
|-------|-------|
| 1.0.0 (1) | First submission — rejected (4 issues) |
| 1.0.0 (2) | Camera + icon fixes |
| 1.0.0 (5) | Rejected — Safari login + 4.8 |
| 1.0.0 (6) | Auth hardening, no Safari for vendor OAuth |
| 1.0.0 (7) | Customer route blocking, shared Google redirect URI |
| 1.0.0 (8) | ASWebAuthenticationSession for Google account picker |

**Current repo:** `vendor-app/app.json` → `buildNumber: "8"`, `APP_RELEASE = '1.0.0.8'`

---

## 8. Key commits (chronological)

| Commit | Author | Description |
|--------|--------|-------------|
| `43f2c73e` | Vinik | Camera Error Fix |
| `4cbd927e` | Sumit | Original logo (icons) |
| `f6616364` | Sumit | Add Apple Sign In |
| `1992a953` | Sumit | Add delete account |
| `3cabace4` | Sumit | Fix Guideline 2.1.a |
| `c66c4d2b` | Sumit | Fix Guideline 4.8 |
| `7e489e7f` | Sumit | Fix Apple login nonce |
| `9b2ca417` | Vinik | BrowserRedirect Fix |
| `7bfb0347` | Vinik | iOS App Fix |
| `a6f9ac37` | Sumit | Android OAuth state fix |

---

## 9. Suggested App Review reply (template)

> **Guideline 4:** Vendor sign-in now completes inside the app. Google OAuth uses ASWebAuthenticationSession (iOS) / Chrome Custom Tabs (Android) and returns to the in-app WebView. We do not open Safari for vendor authentication. Customer login is not accessible from the vendor app.
>
> **Guideline 4.8:** Sign in with Apple is available on the Vendor Sign In screen (iOS), placed alongside Google. Apple Sign In uses the native iOS API via expo-apple-authentication.
>
> **Account deletion:** Settings → Delete Account (password or confirmation phrase required).
>
> **Demo credentials:** [provide test vendor email/password]
>
> **iPad screenshots:** Updated to show Dashboard, Orders, Products, and Earnings after login.

---

## 10. Pre-submission checklist

- [ ] Deploy latest web to production (`origin/main`)
- [ ] Upload IPA **1.0.0 (8)** or higher
- [ ] iPhone 6.5" screenshots at **1242×2688** or **1284×2778**
- [ ] iPad 13" screenshots at **2064×2752** (logged-in screens first)
- [ ] Test Google login → account picker → returns to app logged in
- [ ] Test Apple login on iOS device
- [ ] Test camera on iPad (Add Product → Camera)
- [ ] Confirm customer `/login` not reachable from vendor app

---

*Generated from git history, App Store Connect rejection messages, and codebase audit.*
