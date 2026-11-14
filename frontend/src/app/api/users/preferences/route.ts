import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/src/server/modules/user/user.service";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await userService.updatePreferences(body);

    const response = NextResponse.json(result);
    if (body.language) {
      const locale = String(body.language).toLowerCase();
      response.cookies.set("NEXT_LOCALE", locale, {
        path: "/",
        sameSite: "lax",
        maxAge: 365 * 24 * 60 * 60,
      });
    }
    return response;
  } catch (error) {
    console.error(
      "[BFF /api/users/preferences] Failed to update preferences:",
      error,
    );
    return handleApiError(error);
  }
}
