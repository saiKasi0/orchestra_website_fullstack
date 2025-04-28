import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_LOGIN_PATH = "/admin";
const ADMIN_UNAUTHORIZED_PATH = "/admin/unauthorized";
const ADMIN_BASE_PATH = "/admin/"; // Base path for admin routes

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Check if the path is an admin route that needs protection
  if (path.startsWith(ADMIN_BASE_PATH) && path !== ADMIN_LOGIN_PATH && path !== ADMIN_UNAUTHORIZED_PATH) {
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

  // Allow the request to proceed if authenticated/authorized or not an admin path
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