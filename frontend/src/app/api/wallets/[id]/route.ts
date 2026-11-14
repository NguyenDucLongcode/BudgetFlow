import { NextResponse } from "next/server";
import { serverApiClient } from "@/src/lib/bff/server-api-client";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

type WalletRouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: WalletRouteContext) {
  try {
    const { id } = await context.params;
    const response = await serverApiClient.patch(
      `/wallets/${id}`,
      await request.json(),
    );
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: WalletRouteContext) {
  try {
    const { id } = await context.params;
    const response = await serverApiClient.delete(`/wallets/${id}`);
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}
