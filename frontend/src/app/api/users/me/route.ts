import { NextResponse } from "next/server";
import { userService } from "@/src/server/modules/user/user.service";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

export async function GET() {
  try {
    const user = await userService.getMe();

    return NextResponse.json({
      data: user,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
