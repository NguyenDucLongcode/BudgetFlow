import { NextRequest, NextResponse } from "next/server";
import { serverApiClient } from "@/src/lib/bff/server-api-client";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

type GoalRouteContext = { params: Promise<{ id: string }> };

export async function POST(
  request: NextRequest,
  context: GoalRouteContext,
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const response = await serverApiClient.post(`/goals/${id}/contribute`, body);
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}
