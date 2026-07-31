import { authService } from "@/src/server/modules/auth/auth.service";
import { NextResponse } from "next/server";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

export async function POST() {
  try {
    const response = await authService.refresh();
    console.log("refresh response", response);

    const nextResponse = NextResponse.json({
      success: true,
    });

    // Forward cookie từ BE sang client
    const cookies = response.headers["set-cookie"];
    if (cookies) {
      (Array.isArray(cookies) ? cookies : [cookies]).forEach((cookie) => {
        nextResponse.headers.append("Set-Cookie", cookie);
      });
    }

    return nextResponse;
  } catch (error) {
    return handleApiError(error);
  }
}
