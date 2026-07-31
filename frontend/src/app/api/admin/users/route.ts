import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";
import { adminService } from "@/src/server/modules/admin/admin.service";
import { AdminPaginationUsersDto, Role, UserStatus } from "@/src/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params: AdminPaginationUsersDto = {
      page: Number(searchParams.get("page") ?? 1),
      limit: Number(searchParams.get("limit") ?? 10),
    };

    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    if (search) {
      params.search = search;
    }

    if (role) {
      params.role = role as Role;
    }

    if (status) {
      params.status = status as UserStatus;
    }

    const response = await adminService.getUsers(params);

    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}
