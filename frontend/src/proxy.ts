import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function parseJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    const jsonStr = decodeURIComponent(
      Array.prototype.map
        .call(atob(base64), (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonStr);
  } catch (e: any) {
    try {
      const parts = token.split(".");
      const base64Url = parts[1];
      let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4 !== 0) {
        base64 += "=";
      }
      return JSON.parse(atob(base64));
    } catch {
      console.error("[Proxy Guard] Failed to parse JWT token:", e?.message);
      return null;
    }
  }
}

function ensureLocaleCookie(response: NextResponse, request: NextRequest): NextResponse {
  const localeCookie = request.cookies.get("NEXT_LOCALE")?.value?.toLowerCase();
  if (!localeCookie || (localeCookie !== "vi" && localeCookie !== "en")) {
    response.cookies.set("NEXT_LOCALE", "en", {
      path: "/",
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60,
    });
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/auth/verify-email",
    "/auth/social-success",
  ];

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Case 1: Đã có refresh_token mà đang ở trang public (login/register) -> tự động chuyển về dashboard tương ứng
  if (refreshToken && isPublicRoute) {
    const payload = parseJwtPayload(refreshToken);
    const role = payload?.role;
    const dest = role === "ADMIN" ? "/admin/dashboard" : "/dashboard";
    console.log(
      `[Proxy Guard] Logged-in user on public route (${pathname}), redirecting to ${dest} (role: ${role})`,
    );
    return ensureLocaleCookie(NextResponse.redirect(new URL(dest, request.url)), request);
  }

  // Case 2: Chưa có refresh_token mà vào route private -> redirect về /login
  if (!refreshToken && !isPublicRoute) {
    console.log(
      `[Proxy Guard] Unauthenticated access to private route (${pathname}) -> redirect to /login`,
    );
    return ensureLocaleCookie(NextResponse.redirect(new URL("/login", request.url)), request);
  }

  // Case 3: Bảo vệ riêng khu vực Admin (/admin/*)
  if (pathname.startsWith("/admin")) {
    if (!refreshToken) {
      console.log(
        `[Proxy Guard] Unauthenticated access to admin (${pathname}) -> redirect to /login`,
      );
      return ensureLocaleCookie(NextResponse.redirect(new URL("/login", request.url)), request);
    }

    const payload = parseJwtPayload(refreshToken);
    const role = payload?.role;

    console.log(`[Proxy Guard] Admin access to ${pathname}: detected role = "${role}"`);

    if (role !== "ADMIN") {
      console.warn(
        `[Proxy Guard] Access Denied: User role ("${role}") is not ADMIN -> redirect to /dashboard`,
      );
      return ensureLocaleCookie(NextResponse.redirect(new URL("/dashboard", request.url)), request);
    }
  }

  return ensureLocaleCookie(NextResponse.next(), request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|icons|fonts).*)",
  ],
};
