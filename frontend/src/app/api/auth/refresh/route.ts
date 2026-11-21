import { authService } from "@/src/server/modules/auth/auth.service";
import { NextResponse } from "next/server";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const deviceId =
      request.headers.get("x-device-id") ??
      request.cookies.get("device_id")?.value;
    const refreshToken = request.cookies.get("refresh_token")?.value;

    if (!deviceId || !refreshToken) {
      const missingTokenResponse = NextResponse.json(
        { statusCode: 401, message: "Missing refresh session" },
        { status: 401 },
      );
      clearAuthCookies(missingTokenResponse);
      return missingTokenResponse;
    }

    const response = await authService.refresh({
      headers: {
        "x-device-id": deviceId,
        Cookie: `refresh_token=${refreshToken}`,
      },
    });

    const nextResponse = NextResponse.json({
      success: true,
      data: response.data,
    });

    // Forward cookie từ BE sang client (refresh_token, XSRF-TOKEN)
    const cookies = response.headers["set-cookie"];
    if (cookies) {
      (Array.isArray(cookies) ? cookies : [cookies]).forEach((cookie) => {
        nextResponse.headers.append("Set-Cookie", cookie);
      });
    }

    // Set cookie device_id cho BFF và server components bằng headers.append (để KHÔNG ghi đè Set-Cookie từ BE)
    const responseDeviceId = response.data.data?.deviceId;
    if (responseDeviceId) {
      nextResponse.headers.append(
        "Set-Cookie",
        `device_id=${responseDeviceId}; Path=/; SameSite=Lax`,
      );
    }

    return nextResponse;
  } catch (error) {
    const errorResponse = handleApiError(error);
    clearAuthCookies(errorResponse);
    return errorResponse;
  }
}

function clearAuthCookies(response: NextResponse) {
  response.cookies.set("refresh_token", "", {
    path: "/",
    maxAge: 0,
  });
  response.cookies.set("device_id", "", {
    path: "/",
    maxAge: 0,
  });
  response.cookies.set("XSRF-TOKEN", "", {
    path: "/",
    maxAge: 0,
  });
}
