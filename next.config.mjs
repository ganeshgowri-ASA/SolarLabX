/** @type {import('next').NextConfig} */
const nextConfig = {
  // No remotePatterns: the app never uses next/image with external URLs.
  // Wildcard hostname was removed to close GHSA-g5qg-72qw-gw5v (Image
  // Optimization cache-key confusion) and GHSA-xv57-4mr9-wg8v (content
  // injection via image optimiser).
  transpilePackages: ['@react-pdf/renderer'],
};

export default nextConfig;
