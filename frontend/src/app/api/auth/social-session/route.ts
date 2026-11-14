import { NextRequest, NextResponse } from "next/server";
import { serverClient } from "@/src/lib/axios/axio-server";
import { authService } from "@/src/server/modules/auth/auth.service";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";
import { UserProfile } from "@/src/types/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accessToken, deviceId } = body;

    if (!accessToken || !deviceId) {
      return NextResponse.json(
        { statusCode: 400, message: "Thiếu accessToken hoặc deviceId" },
        { status: 400 },
      );
    }

    // Gọi backend /users/me với bearer token để xác thực và lấy thông tin user
    const res = await serverClient.get<{ statusCode: number; data: UserProfile }>(
      "/users/me",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-device-id": deviceId,
        },
      },
    );

    const user = res.data.data;

    // Lưu session vào Redis BFF
    await authService.saveSocialSession(
      deviceId,
      accessToken,
      user.id,
      user.role,
      "15m",
    );

    return NextResponse.json({
      statusCode: 200,
      message: "Khởi tạo phiên Google OAuth thành công",
      data: {
        user,
        deviceId,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
