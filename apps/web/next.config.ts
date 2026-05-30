import type { NextConfig } from 'next';

// API origin (without the /api/v1 prefix), used to proxy media requests.
const apiOrigin = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001/api/v1'
).replace(/\/api\/v1\/?$/, '');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Workspace packages are shipped as TypeScript source, so Next must
  // transpile them rather than expecting pre-built JS.
  transpilePackages: ['@buildr/types', '@buildr/schemas', '@buildr/utils'],
  typedRoutes: true,
  // Serve uploaded/imported media from the web origin so it loads in every
  // context (VS Code previews, LAN, tunnels, production) — not just when the
  // browser is on the same machine as the API. Stored media URLs are relative
  // ("/uploads/..."); Next proxies them to the API server-side.
  async rewrites() {
    return [
      { source: '/uploads/:path*', destination: `${apiOrigin}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
