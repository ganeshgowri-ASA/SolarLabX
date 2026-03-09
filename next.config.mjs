/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "detect.roboflow.com",
      },
    ],
  },
};

export default nextConfig;
