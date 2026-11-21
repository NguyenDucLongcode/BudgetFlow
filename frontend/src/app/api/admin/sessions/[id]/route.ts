import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/src/server/modules/admin/admin.service";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: sessionId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { statusCode: 400, message: "Thiếu userId để thu hồi phiên" },
        { status: 400 },
      );
    }

    const res = await adminService.revokeUserSession(userId, sessionId);
    return NextResponse.json(res);
  } catch (error) {
    return handleApiError(error);
  }
}
