import { NextRequest, NextResponse } from "next/server";
import { serverApiClient } from "@/src/lib/bff/server-api-client";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

type DebtRouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: DebtRouteContext,
) {
  try {
    const { id } = await context.params;
    const response = await serverApiClient.get(`/debts/${id}/payments`);
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  context: DebtRouteContext,
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const response = await serverApiClient.post(`/debts/${id}/payments`, body);
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}
