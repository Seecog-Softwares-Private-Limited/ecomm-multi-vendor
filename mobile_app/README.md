# Indo Vyapar Customer App

Flutter native app for **customers** shopping on Indo Vyapar (`com.seecogg.indovyapar`).

> **Vendor app:** see [`../vendor-app/`](../vendor-app/) (Expo, `com.seecog.indovyapar`).

## Play Store release

See **[PLAYSTORE-UPLOAD.md](./PLAYSTORE-UPLOAD.md)** for upload steps and the AAB output path.

Build a signed AAB locally:

```powershell
cd mobile_app
flutter build appbundle --release --dart-define=APP_FLAVOR=prod
```

Signing uses `android/key.properties` + `android/app/upload-keystore.jks` (both gitignored — back them up).

## Google Sign-in (customer app)

Requires:

1. Web OAuth client ID in server `GOOGLE_CLIENT_ID` (already used by website Google login)
2. Android OAuth client in Google Cloud for `com.seecogg.indovyapar` with Play/debug/upload SHA-1s
3. Matching `GOOGLE_SERVER_CLIENT_ID` in `assets/env/.env.dev` / `.env.prod` (**Web** client ID — backend audience)
4. Server `GOOGLE_ANDROID_CLIENT_ID` for the Android OAuth client (allow-list; no secret)

Do **not** put the Android client ID in `GOOGLE_SERVER_CLIENT_ID` — that must stay the Web client so ID tokens verify against the backend.
