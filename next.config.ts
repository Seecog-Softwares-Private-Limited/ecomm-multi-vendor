import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@mui/material", "@mui/icons-material"],
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
