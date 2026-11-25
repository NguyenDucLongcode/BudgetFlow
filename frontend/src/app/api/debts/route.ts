import { NextRequest, NextResponse } from "next/server";
import { serverApiClient } from "@/src/lib/bff/server-api-client";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "50";
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const walletId = searchParams.get("walletId");
    const sortBy = searchParams.get("sortBy") || "dueDate";
    const order = searchParams.get("order") || "desc";

    const queryParams: Record<string, string> = {
      page,
      limit,
      sortBy,
      order,
    };

    if (search) queryParams.search = search;
    if (type && type !== "ALL") queryParams.type = type;
    if (status && status !== "ALL") queryParams.status = status;
    if (walletId && walletId !== "ALL") queryParams.walletId = walletId;

    const response = await serverApiClient.get("/debts", {
      params: queryParams,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await serverApiClient.post("/debts", body);
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}
