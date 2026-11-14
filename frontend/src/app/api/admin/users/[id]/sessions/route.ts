import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/src/server/modules/admin/admin.service";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";
import { getCsrfToken } from "@/src/lib/bff/utils/csrf";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const response = await adminService.getUserSessions(id);
    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const csrfToken = await getCsrfToken(request);
    const response = await adminService.revokeAllUserSessions(id, csrfToken);
    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}
