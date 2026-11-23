import { authService } from "@/src/server/modules/auth/auth.service";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await authService.login(body);

    const nextResponse = NextResponse.json(response.data, {
      status: response.status,
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

    // Set cookie NEXT_LOCALE từ user.language để đồng bộ đa thiết bị
    const userLang = (response.data.data?.user as { language?: string } | undefined)?.language;
    if (userLang) {
      const locale = String(userLang).toLowerCase();
      nextResponse.headers.append(
        "Set-Cookie",
        `NEXT_LOCALE=${locale}; Path=/; SameSite=Lax; Max-Age=${365 * 24 * 60 * 60}`,
      );
    }

    return nextResponse;
  } catch (error) {
    return handleApiError(error);
  }
}
