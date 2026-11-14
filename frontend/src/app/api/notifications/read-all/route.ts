import { NextResponse } from "next/server";
import { serverApiClient } from "@/src/lib/bff/server-api-client";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

export async function PATCH() {
  try {
    const response = await serverApiClient.patch("/notifications/read-all");
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}
