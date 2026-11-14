import { authService } from "@/src/server/modules/auth/auth.service";
import { NextResponse } from "next/server";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

export async function POST() {
  try {
    const response = await authService.refresh();

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
    const deviceId = response.data.data?.deviceId;
    if (deviceId) {
      nextResponse.headers.append(
        "Set-Cookie",
        `device_id=${deviceId}; Path=/; SameSite=Lax`,
      );
    }

    return nextResponse;
  } catch (error) {
    return handleApiError(error);
  }
}
