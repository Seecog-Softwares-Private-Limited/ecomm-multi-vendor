import { NextResponse } from "next/server";

/**
 * WebViews (Android especially) often drop Set-Cookie on 302 redirects.
 * Return 200 HTML that already has the auth cookie, then navigate client-side.
 */
export function htmlRedirectWithCookie(destinationUrl: string): NextResponse {
  const safeJson = JSON.stringify(destinationUrl);
  const safeAttr = destinationUrl
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="refresh" content="0;url=${safeAttr}" />
  <title>Signing you in…</title>
  <script>location.replace(${safeJson});</script>
</head>
<body style="font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;background:#F8FAFC;color:#334155">
  <p>Signing you in…</p>
</body>
</html>`;
  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
