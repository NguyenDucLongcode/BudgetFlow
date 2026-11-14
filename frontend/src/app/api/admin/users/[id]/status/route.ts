import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/src/server/modules/admin/admin.service";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";
import { getCsrfToken } from "@/src/lib/bff/utils/csrf";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    let targetStatus: string | undefined;

    try {
      const body = await request.json();
      targetStatus = body?.status;
    } catch {
      // Body có thể trống nếu gọi toggle thông thường
    }

    // Nghiệp vụ: Chặn tuyệt đối không cho phép đặt trạng thái thành PENDING
    if (targetStatus === "PENDING") {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "Admin không được phép đặt trạng thái tài khoản thành PENDING",
        },
        { status: 400 },
      );
    }

    if (
      targetStatus &&
      targetStatus !== "ACTIVE" &&
      targetStatus !== "SUSPENDED"
    ) {
      return NextResponse.json(
        {
          statusCode: 400,
          message: "Trạng thái chỉ có thể là ACTIVE hoặc SUSPENDED",
        },
        { status: 400 },
      );
    }

    const csrfToken = await getCsrfToken(request);
    const response = await adminService.toggleActive(
      id,
      csrfToken,
      targetStatus,
    );
    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}
