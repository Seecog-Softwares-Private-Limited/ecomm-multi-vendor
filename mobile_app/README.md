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
