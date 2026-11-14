import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/src/server/modules/auth/auth.service";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { statusCode: 400, message: "Token xác thực không hợp lệ hoặc bị thiếu" },
        { status: 400 },
      );
    }

    const response = await authService.verifyEmail(token);
    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}
