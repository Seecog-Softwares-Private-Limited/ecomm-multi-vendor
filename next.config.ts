import type { NextConfig } from "next";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Merge .env then properties.env into process.env (only keys missing/empty).
 * Runs only in Node when Next loads this config — never bundled for Edge/browser.
 * Same behavior as env-loader.mjs (used by app.js).
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
  for (const name of [".env", "properties.env"]) {
    const p = resolve(cwd, name);
    if (!existsSync(p)) continue;
    try {
      applyEnvContent(readFileSync(p, "utf8"));
    } catch (e) {
      console.error("[next.config] Failed to read env file:", p, e);
    }
  }
}

loadProjectEnvFiles();

const nextConfig: NextConfig = {
  transpilePackages: ["@mui/material", "@mui/icons-material"],
  cleanDistDir: false,
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
