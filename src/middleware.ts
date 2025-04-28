import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { apiRateLimiter, getIdentifier } from '@/utils/rateLimiter'; // Import rate limiter

const ADMIN_LOGIN_PATH = "/admin";
const ADMIN_UNAUTHORIZED_PATH = "/admin/unauthorized";
const ADMIN_BASE_PATH = "/admin/"; // Base path for admin routes

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Apply rate limiting early for admin paths (excluding login/unauthorized pages)
  if (path.startsWith(ADMIN_BASE_PATH) && path !== ADMIN_LOGIN_PATH && path !== ADMIN_UNAUTHORIZED_PATH) {
    if (apiRateLimiter) {
      const identifier = getIdentifier(req);
      if (identifier) {
        const { success } = await apiRateLimiter.limit(identifier);
        if (!success) {
          console.warn(`Rate limit exceeded for path: ${path} by IP: ${identifier}`);
          // Return a simple 429 response directly from middleware
          return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
            status: 429,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } else {
        console.warn(`Could not determine identifier for rate limiting path: ${path}`);
        // Decide if you want to block requests without an identifier
        // return new NextResponse(JSON.stringify({ error: "Could not identify request source" }), { status: 400 });
      }
    }

    // --- Authentication/Authorization Checks ---
    const session = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // If no session, redirect to login
    if (!session) {
      // Preserve the original destination for redirection after login if needed
      const loginUrl = new URL(ADMIN_LOGIN_PATH, req.url);
      // loginUrl.searchParams.set("callbackUrl", path); // Optional: add callback URL
      return NextResponse.redirect(loginUrl);
    }

    // Check for allowed roles
    const allowedRoles = ["admin", "leadership"];
    if (!session.role || !allowedRoles.includes(session.role as string)) {
      // Redirect to the admin-specific unauthorized page
      return NextResponse.redirect(new URL(ADMIN_UNAUTHORIZED_PATH, req.url));
    }
  }

  // Allow the request to proceed if not rate-limited, authenticated/authorized, or not an admin path
  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths under /admin/ except for:
   * - /admin (the login page itself)
   * - /admin/unauthorized (the unauthorized page)
   * - API routes (/_next/static, /_next/image, /favicon.ico are implicitly excluded)
   * - Specific files like images or static assets if needed (though _next handles most)
   */
  matcher: ["/admin/:path*"],
};