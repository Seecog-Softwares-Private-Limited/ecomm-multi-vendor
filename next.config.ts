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
  /**
   * Serve /uploads/* via App Route (before filesystem) so KYC PDFs work in production
   * even when public-file handling or cwd differs from dev.
   */
  async rewrites() {
    /* Array form avoids object-shape edge cases in some Next 15 + TS setups */
    return [{ source: "/uploads/:path*", destination: "/api/uploads/:path*" }];
  },
  async redirects() {
    return [
      { source: "/superadmin/login.", destination: "/superadmin/login", permanent: false },
    ];
  },
  webpack: (config, { dev }) => {
    // Disable filesystem cache in dev to avoid ENOENT when .next is in OneDrive/synced folders
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
