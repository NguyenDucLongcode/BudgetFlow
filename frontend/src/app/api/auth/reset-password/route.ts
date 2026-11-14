import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/src/server/modules/auth/auth.service";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, newPassword, confirmPassword } = body;

    if (!token || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { statusCode: 400, message: "Thiếu thông tin đặt lại mật khẩu" },
        { status: 400 },
      );
    }

    const response = await authService.resetPassword({
      token,
      newPassword,
      confirmPassword,
    });
    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}
