import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Check if the path is for the admin dashboard
  const isAdminPath = path.startsWith("/admin/dashboard");
  
  if (isAdminPath) {
    const session = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // If no session, redirect to login
    if (!session) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // Check for admin role
    if (!["admin", "student"].includes(session.role)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*"],
};