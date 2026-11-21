import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/src/server/modules/auth/auth.service";
import { accessTokenStore } from "@/src/server/modules/auth/session";

export async function POST(req: NextRequest) {
  const deviceId =
    req.headers.get("x-device-id") ||
    req.cookies.get("device_id")?.value ||
    req.cookies.get("x-device-id")?.value;

  try {
    if (deviceId) {
      // 1. Gọi sang Backend NestJS endpoint /auth/logout (kèm deviceId & token qua serverApiClient)
      await authService.logout(deviceId).catch((err) => {
        console.warn("[BFF /api/auth/logout] Backend logout note:", err?.message || err);
      });

      // Xóa access token trong Redis BFF
      await accessTokenStore.remove(deviceId).catch(() => {});
    }
  } catch (error: any) {
    console.warn("[BFF /api/auth/logout] Exception during logout (ignored):", error?.message || error);
  }

  // 2. Trả về response có Set-Cookie xóa sạch cookie refresh_token (Max-Age=0)
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  clearAuthCookies(response);
  return response;
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
