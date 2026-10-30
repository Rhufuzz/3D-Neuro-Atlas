/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  // The original build skips type errors during `next build`; run `npm run typecheck` separately.
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
};

module.exports = nextConfig;
