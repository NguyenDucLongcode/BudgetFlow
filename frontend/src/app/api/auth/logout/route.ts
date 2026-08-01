import { NextRequest, NextResponse } from "next/server";

import { authService } from "@/src/server/modules/auth/auth.service";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

export async function POST(req: NextRequest) {
  try {
    const deviceId = req.headers.get("x-device-id") ?? undefined;

    if (!deviceId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing device ID",
        },
        {
          status: 400,
        },
      );
    }

    const response = await authService.logout(deviceId);

    const nextResponse = NextResponse.json(response.data, {
      status: response.status,
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
