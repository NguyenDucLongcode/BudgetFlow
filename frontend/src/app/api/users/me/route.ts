import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/src/server/modules/user/user.service";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";
import { accessTokenStore } from "@/src/server/modules/auth/session";

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const deviceId =
      request.headers.get("x-device-id") ||
      request.cookies.get("device_id")?.value ||
      request.cookies.get("x-device-id")?.value ||
      requestUrl.searchParams.get("deviceId");

    // Nếu không tìm thấy deviceId -> Trả về 401 ngay lập tức
    if (!deviceId) {
      return NextResponse.json(
        {
          statusCode: 401,
          message: "Device ID header or cookie is missing",
          timestamp: new Date().toISOString(),
          path: "/api/users/me",
        },
        { status: 401 },
      );
    }

    // Đọc session từ Redis bằng key bff:access:device:{deviceId}
    const session = await accessTokenStore.get(deviceId);

    // Nếu không tìm thấy Access Token hoặc đã hết hạn trong Redis -> Trả về 401 ngay lập tức
    if (
      !session?.accessToken ||
      (session.expiresAt > 0 && session.expiresAt <= Date.now())
    ) {
      if (session) {
        await accessTokenStore.remove(deviceId).catch(() => {});
      }
      return NextResponse.json(
        {
          statusCode: 401,
          message: "Authorization session is missing or expired in Redis",
          timestamp: new Date().toISOString(),
          path: "/api/users/me",
        },
        { status: 401 },
      );
    }

    // Khi đã chắc chắn có Access Token trong Redis, gọi sang backend
    const user = await userService.getMe();
    const res = NextResponse.json(user);

    const userLang = user?.data?.language;
    if (userLang) {
      const locale = String(userLang).toLowerCase();
      res.cookies.set("NEXT_LOCALE", locale, {
        path: "/",
        sameSite: "lax",
        maxAge: 365 * 24 * 60 * 60,
      });
    }

    return res;
  } catch (error) {
    console.warn(
      "[BFF /api/users/me] Profile fetch error:",
      error instanceof Error ? error.message : String(error),
    );
    return handleApiError(error);
  }
}
