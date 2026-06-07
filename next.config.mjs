/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  // CSP in report-only mode — promotes to enforcing once coverage is confirmed
  // (upgrade to Content-Security-Policy once visual testing confirms no breakage)
  {
    key: "Content-Security-Policy-Report-Only",
    value: [
      "default-src 'self'",
      // Next.js 14 App Router requires unsafe-inline + unsafe-eval for hydration
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      // blob: needed by jsPDF / react-pdf for generated documents
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      // worker-src blob: needed for @react-pdf/renderer's PDF worker
      "worker-src 'self' blob:",
      // External API endpoints used by the app
      "connect-src 'self' https://api.anthropic.com https://detect.roboflow.com https://storage.roboflow.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig = {
  images: {
    remotePatterns: [
      // Vercel preview deployments
      {
        protocol: "https",
        hostname: "*.vercel.app",
      },
      // Roboflow — defect detection image storage
      {
        protocol: "https",
        hostname: "storage.roboflow.com",
      },
      {
        protocol: "https",
        hostname: "detect.roboflow.com",
      },
      // GitHub user avatars (used by NextAuth session display)
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      // Broad fallback for lab equipment/module image URLs from external sources;
      // tighten once image domains are fully enumerated (see #180)
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  transpilePackages: ["@react-pdf/renderer"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
