import { NextRequest, NextResponse } from "next/server";

// Paths that should NEVER be redirected, even when coming-soon mode is ON
const BYPASS_PREFIXES = [
  "/dashboard",
  "/admin-login",
  "/api/",
  "/_next/",
  "/favicon",
  "/apple-touch-icon",
];

function shouldBypass(pathname: string): boolean {
  return BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow bypassed routes
  if (shouldBypass(pathname)) {
    return NextResponse.next();
  }

  try {
    // Fetch coming-soon settings from our own API
    // Use absolute URL so it works in both dev and production
    const baseUrl = req.nextUrl.origin;
    const res = await fetch(`${baseUrl}/api/settings/coming-soon`, {
      // Short timeout to avoid blocking requests if DB is slow
      signal: AbortSignal.timeout(3000),
      headers: { "x-internal-request": "middleware" },
    });

    if (res.ok) {
      const json = await res.json();
      const isEnabled = json?.data?.isEnabled === true;

      if (isEnabled) {
        // Redirect to coming-soon page
        if (pathname !== "/coming-soon") {
          const url = req.nextUrl.clone();
          url.pathname = "/coming-soon";
          return NextResponse.redirect(url);
        }
      } else {
        // If mode is OFF and user tries to access /coming-soon, redirect to home
        if (pathname === "/coming-soon") {
          const url = req.nextUrl.clone();
          url.pathname = "/";
          return NextResponse.redirect(url);
        }
      }
    }
  } catch {
    // If the settings fetch fails (DB unavailable, timeout), allow the site through
    // to avoid a total outage
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except static files and Next.js internals
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|apple-touch-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)",
  ],
};
