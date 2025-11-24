import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { routeAccessMap } from "./lib/settings";
import { NextResponse } from "next/server";


const isPublicRoute = createRouteMatcher(['/sign-in(.*)']);

const matchers = Object.keys(routeAccessMap).map((route) => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: routeAccessMap[route],
}));

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  if (!userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
  const role = ((sessionClaims?.metadata as { role?: string })?.role || "").toLowerCase();

  console.log("Role:", role, "URL:", req.nextUrl.pathname);

  for (const { matcher, allowedRoles } of matchers) {
    if (matcher(req)) {
      console.log("Matched:", allowedRoles, "for", req.nextUrl.pathname);
      if (!allowedRoles.includes(role)) {
        console.log("❌ Redirecting to /" + role);
        return NextResponse.redirect(new URL(`/${role}`, req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};