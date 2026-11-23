import { NextResponse } from "next/server";
import { serverApiClient } from "@/src/lib/bff/server-api-client";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

export async function GET() {
  try {
    const response = await serverApiClient.get("/goals/summary");
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}
