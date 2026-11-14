import { NextRequest, NextResponse } from "next/server";
import { serverApiClient } from "@/src/lib/bff/server-api-client";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(new URL(request.url).searchParams.entries());
    const response = await serverApiClient.get("/notifications", params);
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}
