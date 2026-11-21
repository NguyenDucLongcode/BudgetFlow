import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/src/server/modules/auth/auth.service";
import { accessTokenStore } from "@/src/server/modules/auth/session";

export async function POST(req: NextRequest) {
  const deviceId =
    req.headers.get("x-device-id") ||
    req.cookies.get("device_id")?.value ||
    req.cookies.get("x-device-id")?.value;

  try {
    await authService.logoutAll(deviceId).catch((err) => {
      console.warn("[BFF /api/auth/logout-all] Backend logout-all note:", err?.message || err);
    });

    if (deviceId) {
      await accessTokenStore.remove(deviceId).catch(() => {});
    }
  } catch (error: any) {
    console.warn("[BFF /api/auth/logout-all] Exception during logoutAll (ignored):", error?.message || error);
  }

  const nextResponse = NextResponse.json({
    success: true,
    message: "Logged out from all devices",
  });

  clearAuthCookies(nextResponse);
  return nextResponse;
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
