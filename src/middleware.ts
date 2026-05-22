import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isRenterRoute = nextUrl.pathname.startsWith("/renter");
  const isLoginPage = nextUrl.pathname === "/login";

  if (isLoginPage && isLoggedIn) {
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
    }
    return NextResponse.redirect(new URL("/renter/bills", nextUrl));
  }

  if ((isAdminRoute || isRenterRoute) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/renter/bills", nextUrl));
  }

  if (isRenterRoute && role !== "RENTER") {
    return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/renter/:path*", "/login"],
};
