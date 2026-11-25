import { NextRequest, NextResponse } from "next/server";
import { serverApiClient } from "@/src/lib/bff/server-api-client";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

type RecurringRouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RecurringRouteContext,
) {
  try {
    const { id } = await context.params;
    const response = await serverApiClient.get(`/recurring-transactions/${id}`);
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: RecurringRouteContext,
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const response = await serverApiClient.patch(
      `/recurring-transactions/${id}`,
      body,
    );
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RecurringRouteContext,
) {
  try {
    const { id } = await context.params;
    const response = await serverApiClient.delete(
      `/recurring-transactions/${id}`,
    );
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}
