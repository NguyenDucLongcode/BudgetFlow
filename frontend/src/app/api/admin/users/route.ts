import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";
import { adminService } from "@/src/server/modules/admin/admin.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params = Object.fromEntries(searchParams.entries());

    const response = await adminService.getUsers(params);

    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}
