import { NextResponse } from "next/server";
import { serverApiClient } from "@/src/lib/bff/server-api-client";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const response = await serverApiClient.patch(`/wallets/${id}/set-default`);
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}
