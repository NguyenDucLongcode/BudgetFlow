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
  const { pathname, searchParams } = request.nextUrl;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const isHome = pathname === "/";

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

  const refreshPayload = refreshToken ? parseJwtPayload(refreshToken) : null;
  const refreshExpired =
    Boolean(refreshPayload?.exp) && refreshPayload!.exp * 1000 <= Date.now();
  const refreshInvalid = Boolean(refreshToken) && (!refreshPayload || refreshExpired);

  // 1. Nếu refresh token không hợp lệ hoặc hết hạn: xóa cookie và hiển thị trang (nếu public/home) hoặc redirect về /login (nếu private)
  if (refreshInvalid) {
    console.warn(`[Proxy Guard] Invalid or expired refresh token on ${pathname} -> clearing auth cookies`);
    const response = isPublicRoute || isHome
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/login", request.url));
    clearAuthCookies(response);
    return ensureLocaleCookie(response, request);
  }

  // 2. Xử lý trang chủ (/):
  // - Nếu ĐÃ đăng nhập: Tự động redirect sang /admin/dashboard (ADMIN) hoặc /dashboard (USER)
  // - Nếu CHƯA đăng nhập: Cho phép hiển thị Landing Page
  if (isHome) {
    if (refreshToken && refreshPayload && !refreshExpired) {
      const role = refreshPayload.role;
      const dest = role === "ADMIN" ? "/admin/dashboard" : "/dashboard";
      console.log(`[Proxy Guard] Authenticated user on home (/) -> redirecting to ${dest} (role: ${role})`);
      return ensureLocaleCookie(NextResponse.redirect(new URL(dest, request.url)), request);
    }
    return ensureLocaleCookie(NextResponse.next(), request);
  }

  // 3. Nếu truy cập /login mà có param báo lỗi (error, failed, session_expired)
  // Cho phép hiển thị trang login thay vì tự động đá về dashboard, đồng thời dọn sạch cookie hỏng
  if (pathname.startsWith("/login")) {
    const hasError =
      searchParams.has("error") ||
      searchParams.has("failed") ||
      searchParams.has("logout") ||
      searchParams.has("session_expired");

    if (hasError) {
      console.log(
        `[Proxy Guard] User routed to /login with error param -> allowing login page and clearing cookies`,
      );
      const response = NextResponse.next();
      clearAuthCookies(response);
      return ensureLocaleCookie(response, request);
    }
  }

  // 4. Chỉ redirect từ public route (/login, /register...) vào dashboard khi:
  // - Đang ở route public
  // - VÀ thực sự có cookie refresh_token còn hạn
  // - VÀ không có query param báo lỗi
  if (refreshToken && refreshPayload && !refreshExpired && isPublicRoute) {
    const role = refreshPayload.role;
    const dest = role === "ADMIN" ? "/admin/dashboard" : "/dashboard";
    console.log(
      `[Proxy Guard] Authenticated user on ${pathname} -> redirecting to ${dest} (role: ${role})`,
    );
    return ensureLocaleCookie(NextResponse.redirect(new URL(dest, request.url)), request);
  }

  // 5. Nếu chưa có refresh_token mà truy cập route private (user hoặc admin) -> redirect về /login
  if (!refreshToken && !isPublicRoute && !isHome) {
    console.log(
      `[Proxy Guard] Unauthenticated access to private route (${pathname}) -> redirect to /login`,
    );
    return ensureLocaleCookie(NextResponse.redirect(new URL("/login", request.url)), request);
  }

  // 6. Bảo vệ riêng khu vực Admin (/admin/*): Phải có refresh_token và role là ADMIN
  if (pathname.startsWith("/admin")) {
    if (!refreshToken || !refreshPayload) {
      console.log(
        `[Proxy Guard] Unauthenticated access to admin (${pathname}) -> redirect to /login`,
      );
      const response = NextResponse.redirect(new URL("/login", request.url));
      clearAuthCookies(response);
      return ensureLocaleCookie(response, request);
    }

    const role = refreshPayload.role;
    if (role !== "ADMIN") {
      console.warn(
        `[Proxy Guard] Access Denied: User role ("${role}") is not ADMIN -> redirect to /dashboard`,
      );
      return ensureLocaleCookie(NextResponse.redirect(new URL("/dashboard", request.url)), request);
    }
  }

  return ensureLocaleCookie(NextResponse.next(), request);
}

function clearAuthCookies(response: NextResponse) {
  response.cookies.set("refresh_token", "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    expires: new Date(0),
  });
  response.cookies.set("device_id", "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    expires: new Date(0),
  });
  response.cookies.set("XSRF-TOKEN", "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    expires: new Date(0),
  });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|icons|fonts).*)",
  ],
};
