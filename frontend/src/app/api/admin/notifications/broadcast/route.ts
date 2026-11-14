import { NextResponse } from "next/server";
import { serverApiClient } from "@/src/lib/bff/server-api-client";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await serverApiClient.post(
      "/admin/notifications/broadcast",
      body,
    );
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}
