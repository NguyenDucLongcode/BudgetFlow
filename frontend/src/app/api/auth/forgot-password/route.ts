import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/src/server/modules/auth/auth.service";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email;

    if (!email) {
      return NextResponse.json(
        { statusCode: 400, message: "Email là bắt buộc" },
        { status: 400 },
      );
    }

    const response = await authService.forgotPassword(email);
    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}
