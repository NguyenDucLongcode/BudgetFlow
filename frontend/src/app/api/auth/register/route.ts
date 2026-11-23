import { authService } from "@/src/server/modules/auth/auth.service";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value?.toUpperCase() || "EN";
    const language = cookieLocale === "VI" ? "VI" : "EN";

    // Gọi BE kèm theo ngôn ngữ từ cookie hiện tại
    const response = await authService.register({
      ...body,
      language,
    });

    const nextResponse = NextResponse.json(response, {
      status: response.statusCode ?? 201,
    });

    return nextResponse;
  } catch (error) {
    return handleApiError(error);
  }
}
