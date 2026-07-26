import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Route protection at the edge. This is a cheap, cookie-presence check
 * (no DB call) so it stays fast - the real, authoritative permission
 * checks (role, ownership) happen server-side in each route handler and
 * page, since a valid cookie only proves "signed in", not "allowed".
 */
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
