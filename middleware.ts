import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Guard all /api/* routes except the NextAuth endpoints themselves.
// Unauthenticated callers to /api/chat, /api/sop/generate, /api/vision/detect,
// and /api/reports/generate would otherwise consume paid API keys with no
// session check — see issue #103.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public: NextAuth callbacks, health probe
  const isPublic =
    pathname.startsWith("/api/auth") || pathname === "/api/health";

  if (!isPublic && pathname.startsWith("/api/")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
