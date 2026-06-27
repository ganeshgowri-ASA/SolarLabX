/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Wildcard hostname removed — GHSA-g5qg-72qw-gw5v / GHSA-9g9p-9gw9-jx7f / GHSA-h64f-5h5j-jqjh.
    // Add explicit entries here when external <Image> sources are needed, e.g.:
    //   { protocol: "https", hostname: "assets.example.com" }
    remotePatterns: [],
  },
  transpilePackages: ['@react-pdf/renderer'],
};

export default nextConfig;
