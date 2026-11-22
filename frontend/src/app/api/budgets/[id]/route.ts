import { NextRequest, NextResponse } from "next/server";
import { serverApiClient } from "@/src/lib/bff/server-api-client";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

type BudgetRouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: BudgetRouteContext,
) {
  try {
    const { id } = await context.params;
    const response = await serverApiClient.get(`/budgets/${id}`);
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: BudgetRouteContext,
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const response = await serverApiClient.patch(`/budgets/${id}`, body);
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: BudgetRouteContext,
) {
  try {
    const { id } = await context.params;
    const response = await serverApiClient.delete(`/budgets/${id}`);
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}
