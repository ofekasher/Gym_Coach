import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// In demo mode (no real DB configured), skip all auth checks
const dbUrl = process.env.DATABASE_URL ?? "";
const isDemoMode =
  dbUrl.length === 0 ||
  dbUrl.includes("[project-ref]") ||
  dbUrl.includes("[password]") ||
  dbUrl.includes("[region]") ||
  dbUrl.includes("placeholder");

export default auth((req) => {
  if (isDemoMode) return NextResponse.next();

  const { pathname } = req.nextUrl;
  const session = req.auth;

  const publicPaths = ["/login", "/register", "/invite"];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (session) {
    const role = session.user?.role;

    if (pathname.startsWith("/dashboard") || pathname.startsWith("/trainees") || pathname.startsWith("/exercises") || pathname.startsWith("/schedule") || pathname.startsWith("/payments") || pathname.startsWith("/settings") || pathname === "/invite") {
      if (role !== "COACH") {
        return NextResponse.redirect(new URL("/my/dashboard", req.url));
      }
    }

    if (pathname.startsWith("/my")) {
      if (role !== "TRAINEE") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    if ((pathname === "/login" || pathname === "/register") && session) {
      const redirect = role === "COACH" ? "/dashboard" : "/my/dashboard";
      return NextResponse.redirect(new URL(redirect, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|js)$).*)"],
};
