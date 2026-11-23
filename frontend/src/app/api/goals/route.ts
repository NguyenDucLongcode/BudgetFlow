import { NextRequest, NextResponse } from "next/server";
import { serverApiClient } from "@/src/lib/bff/server-api-client";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "50";
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const walletId = searchParams.get("walletId");
    const isArchived = searchParams.get("isArchived");
    const sortBy = searchParams.get("sortBy") || "targetDate";
    const order = searchParams.get("order") || "asc";

    const queryParams: Record<string, string> = {
      page,
      limit,
      sortBy,
      order,
    };

    if (search) queryParams.search = search;
    if (status && status !== "ALL") queryParams.status = status;
    if (priority && priority !== "ALL") queryParams.priority = priority;
    if (walletId && walletId !== "ALL") queryParams.walletId = walletId;
    if (isArchived !== null && isArchived !== undefined && isArchived !== "ALL") {
      queryParams.isArchived = isArchived;
    }

    const response = await serverApiClient.get("/goals", {
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
    const response = await serverApiClient.post("/goals", body);
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}
