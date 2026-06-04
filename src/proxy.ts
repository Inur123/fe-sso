import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;

  const isAuthPage = nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register") ||
    nextUrl.pathname.startsWith("/verify-email") ||
    nextUrl.pathname.startsWith("/forgot-password") ||
    nextUrl.pathname.startsWith("/reset-password");

  const isPublicPath = nextUrl.pathname.startsWith("/api/auth") ||
    nextUrl.pathname === "/" ||
    nextUrl.pathname === "/logo-sso.png";

  // Redirect ke /dashboard jika sudah login tapi buka halaman auth
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Redirect ke /login jika belum login dan bukan halaman publik/auth
  if (!isLoggedIn && !isAuthPage && !isPublicPath) {
    const loginUrl = new URL("/login", nextUrl);
    // Simpan url asal (termasuk seluruh query params OAuth) sebagai callbackUrl
    loginUrl.searchParams.set("callbackUrl", nextUrl.toString());
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo-sso.png).*)",
  ],
};
