import { NextResponse } from "next/server";
import { userService } from "@/src/server/modules/user/user.service";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

export async function GET() {
  try {
    const user = await userService.getMe();
    const res = NextResponse.json(user);

    const userLang = (user?.data as any)?.language;
    if (userLang) {
      const locale = String(userLang).toLowerCase();
      res.cookies.set("NEXT_LOCALE", locale, {
        path: "/",
        sameSite: "lax",
        maxAge: 365 * 24 * 60 * 60,
      });
    }

    return res;
  } catch (error) {
    console.error("[BFF /api/users/me] Failed to fetch current user profile:", error);
    return handleApiError(error);
  }
}
