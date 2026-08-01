import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";
import { authService } from "@/src/server/modules/auth/auth.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const deviceId = req.headers.get("x-device-id") ?? undefined;
    const response = await authService.logoutAll(deviceId);

    const nextResponse = NextResponse.json({
      success: true,
    });

    const cookies = response.headers["set-cookie"];

    if (cookies) {
      (Array.isArray(cookies) ? cookies : [cookies]).forEach((cookie) => {
        nextResponse.headers.append("Set-Cookie", cookie);
      });
    }

    return nextResponse;
  } catch (error) {
    return handleApiError(error);
  }
}
