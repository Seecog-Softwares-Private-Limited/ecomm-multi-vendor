/// JavaScript environment marker for the Flutter Customer App WebView.
///
/// Injected into IndoVyapar pages so the Next.js storefront can detect that
/// it is running inside the Customer App shell.
///
/// This is an environment indicator only — not authentication or trust.
const String customerNativeMarkerJavaScript =
    'window.__INDOVYAPAR_CUSTOMER_NATIVE__=true;';
