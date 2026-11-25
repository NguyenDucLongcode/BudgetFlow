import { NextRequest, NextResponse } from "next/server";
import { serverApiClient } from "@/src/lib/bff/server-api-client";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

type RecurringRouteContext = { params: Promise<{ id: string }> };

export async function PATCH(
  _request: NextRequest,
  context: RecurringRouteContext,
) {
  try {
    const { id } = await context.params;
    const response = await serverApiClient.patch(
      `/recurring-transactions/${id}/pause`,
    );
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}
