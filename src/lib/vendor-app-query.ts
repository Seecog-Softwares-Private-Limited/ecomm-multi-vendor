/**
 * Hybrid vendor app (Expo WebView) query params preserved through auth redirects.
 * `app=1` enables app-mode chrome; `v` busts CDN/WebView cache on cold start.
 */
export const VENDOR_APP_CONTEXT_PARAMS = ["app", "v"] as const;

export function copyVendorAppContextParams(
  from: URLSearchParams,
  to: URLSearchParams
): void {
  for (const key of VENDOR_APP_CONTEXT_PARAMS) {
    const value = from.get(key);
    if (value != null && value !== "") {
      to.set(key, value);
    }
  }
}

/** Build `/vendor/login?callbackUrl=…&app=1&v=…` for client or middleware redirects. */
export function buildVendorLoginPath(
  callbackPath: string,
  sourceSearchParams?: URLSearchParams | null,
  loginPath = "/vendor/login"
): string {
  const params = new URLSearchParams();
  params.set("callbackUrl", callbackPath);
  if (sourceSearchParams) {
    copyVendorAppContextParams(sourceSearchParams, params);
  }
  return `${loginPath}?${params.toString()}`;
}
