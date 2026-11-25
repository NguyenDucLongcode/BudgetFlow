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
    const frequency = searchParams.get("frequency");
    const walletId = searchParams.get("walletId");
    const categoryId = searchParams.get("categoryId");
    const isActive = searchParams.get("isActive");
    const sortBy = searchParams.get("sortBy") || "nextRunDate";
    const order = searchParams.get("order") || "asc";

    const queryParams: Record<string, string> = {
      page,
      limit,
      sortBy,
      order,
    };

    if (search) queryParams.search = search;
    if (type && type !== "ALL") queryParams.type = type;
    if (frequency && frequency !== "ALL") queryParams.frequency = frequency;
    if (walletId && walletId !== "ALL") queryParams.walletId = walletId;
    if (categoryId && categoryId !== "ALL") queryParams.categoryId = categoryId;
    if (isActive !== null && isActive !== undefined && isActive !== "ALL") {
      queryParams.isActive = isActive;
    }

    const response = await serverApiClient.get("/recurring-transactions", {
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
    const response = await serverApiClient.post("/recurring-transactions", body);
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}
