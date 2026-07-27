# Play Store upload — 1-hour checklist

## Versioning (important)

**Only edit `pubspec.yaml` → `version:`** (format `name+code`, e.g. `1.0.3+7`).

- `1.0.3` = version name (shown to users)
- `7` = version code (must increase every Play upload; must be **higher than the current live release**)

Android `build.gradle.kts` and iOS `Info.plist` read from pubspec automatically — do not duplicate version numbers elsewhere.

---

## Your signed AAB (after build)

```
mobile_app/build/app/outputs/bundle/release/app-release.aab
```

Upload this file in [Google Play Console](https://play.google.com/console) → **Your app** → **Release** → **Production** (or **Internal testing** first).

---

## App identity

| Field | Value |
|-------|--------|
| Package | `com.seecogg.indovyapar` |
| Version name | `1.0.3` |
| Version code | `7` |
| API (prod) | `https://indovyapar.com` |

---

## Signing credentials (BACK UP — do not lose)

Keystore file (keep offline backup):

```
mobile_app/android/app/upload-keystore.jks
```

Credentials are in `mobile_app/android/key.properties` (gitignored).

**If you lose the keystore, you cannot update this app on Play Store.**

---

## Play Console — minimum for first upload

1. **Create app** (if not exists) with package `com.seecogg.indovyapar`
2. **App signing**: Google Play App Signing — upload the AAB; Google manages the app signing key
3. **Store listing**: title, short description, full description, screenshots (phone), feature graphic
4. **App content**:
   - Privacy policy URL (required) — e.g. `https://indovyapar.com/legal/privacy-policy`
   - Data safety form
   - Target audience
5. **Release** → upload AAB → review

---

## Build commands (local)

```powershell
cd "d:\Seecog projects\ecomm-multi-vendor\mobile_app"
flutter pub get
flutter build appbundle --release --dart-define=APP_FLAVOR=prod
```

---

## Known limitations (OK for v1 upload, fix later)

- ~~Online payment (Razorpay) UI exists but in-app payment flow not wired — COD works~~
- **Razorpay (UPI/card)** wired in checkout — requires server `RAZORPAY_*` keys in production `.env`
- No Google sign-in in app — email/password + OTP work
- App icon is default Flutter launcher — replace before marketing release

---

## If Play rejects signing

- **New app**: use the keystore generated today
- **Existing app on Play**: you must use the **original** upload keystore — replace `upload-keystore.jks` and `key.properties` with your existing files
