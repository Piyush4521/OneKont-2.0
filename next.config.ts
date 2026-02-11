import withPWA from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep Turbopack config present to avoid Next.js 16 warnings when plugins add webpack config.
  turbopack: {},
};

const pwaConfig = withPWA({
  dest: "public", // Where to put the service worker
  cacheOnFrontEndNav: true, // Cache pages as you browse
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true, // Reload when back online
  disable: process.env.NODE_ENV === "development", // Disable PWA in dev mode (so it doesn't annoy you)
});

export default pwaConfig(nextConfig);
