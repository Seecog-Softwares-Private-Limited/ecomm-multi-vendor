import type { NextConfig } from "next";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Load .env into process.env (only keys missing/empty).
 * properties.env is deprecated and is not loaded.
 * Runs only in Node when Next loads this config — never bundled for Edge/browser.
 */
function applyEnvContent(content: string) {
  for (const line of content.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    if (!key) continue;
    let value = t.slice(i + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1).replace(/\\n/g, "\n");
    }
    const cur = process.env[key];
    if (cur === undefined || cur === "") {
      process.env[key] = value;
    }
  }
}

function loadProjectEnvFiles(cwd: string = process.cwd()) {
  const p = resolve(cwd, ".env");
  if (!existsSync(p)) return;
  try {
    applyEnvContent(readFileSync(p, "utf8"));
  } catch (e) {
    console.error("[next.config] Failed to read env file:", p, e);
  }
}

loadProjectEnvFiles();

/** Default `cleanDistDir` (true) clears `.next` each build — avoids stale chunks vs new HTML after deploy. */
const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  productionBrowserSourceMaps: false,
  // Enable gzip compression for all responses
  compress: true,
  // Remove X-Powered-By header (small security + perf win)
  poweredByHeader: false,
  // Optimise images: serve WebP/AVIF, cache for 1 year
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  async headers() {
    return [
      {
        // Vendor hybrid app loads live HTML in WebView — never cache HTML (UA-specific stale bundles).
        source: "/vendor/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, no-cache, must-revalidate" }],
      },
      {
        // Cache static assets (JS, CSS, fonts, images) for 1 year
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // Cache public images/icons for 7 days
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
      {
        // Cache category/product API for 60s at CDN level
        source: "/api/categories/:path*",
        headers: [{ key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=600" }],
      },
    ];
  },
  async rewrites() {
    return [{ source: "/uploads/:path*", destination: "/api/uploads/:path*" }];
  },
  async redirects() {
    return [
      { source: "/superadmin/login.", destination: "/superadmin/login", permanent: false },
    ];
  },
  webpack: (config) => {
    config.cache = false;
    return config;
  },
};

export default nextConfig;
