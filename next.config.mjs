/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.vercel.app" },
      { protocol: "https", hostname: "*.vercel.com" },
      { protocol: "https", hostname: "storage.roboflow.com" },
      { protocol: "https", hostname: "detect.roboflow.com" },
      // Add additional trusted hostnames here; avoid wildcard "**" (SSRF risk)
    ],
  },
  transpilePackages: ['@react-pdf/renderer'],
};

export default nextConfig;
