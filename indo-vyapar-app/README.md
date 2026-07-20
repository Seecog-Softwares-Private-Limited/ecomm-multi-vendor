# Indo Vyapar Vendor App

Expo / React Native WebView shell for **vendors and sellers** on Indo Vyapar. Loads the vendor portal from the main website with native bridge support (camera, location, biometrics, push, etc.).

> **Customer app:** see [`../mobile_app/`](../mobile_app/) (Flutter, `com.indovyapar.indovyapar_customer`).

| App | Folder | Audience | Package |
|-----|--------|----------|---------|
| Vendor | `indo-vyapar-app/` | Sellers / vendors | `com.seecog.indovyapar` |
| Customer | `mobile_app/` | Shoppers | `com.indovyapar.indovyapar_customer` |

## URLs

Configured in `app.json` → `expo.extra`:

| Environment | URL |
|-------------|-----|
| Production | `https://indovyapar.com/vendor/login` |
| Development | `http://localhost:3005/vendor/login` (falls back to prod on physical devices when localhost is unreachable) |

## Run locally

1. Start the Next.js backend (`npm run dev` in the repo root).
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start Expo:

   ```bash
   npm run start
   ```

4. Run on Android or iOS:

   ```bash
   npm run android
   npm run ios
   ```

## Build (EAS)

```bash
npx eas build --platform android --profile production
```
