import { NextRequest, NextResponse } from "next/server";
import { serverApiClient } from "@/src/lib/bff/server-api-client";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "100";
    const isArchived = searchParams.get("isArchived");
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    const sortBy = searchParams.get("sortBy");
    const order = searchParams.get("order");

    const queryParams: Record<string, string> = {
      page,
      limit,
    };
    if (isArchived !== null && isArchived !== undefined) {
      queryParams.isArchived = isArchived;
    }
    if (search) queryParams.search = search;
    if (type) queryParams.type = type;
    if (sortBy) queryParams.sortBy = sortBy;
    if (order) queryParams.order = order;

    console.log("[BFF GET /api/wallets] Clean query params:", queryParams);

    const response = await serverApiClient.get("/wallets", {
      params: queryParams,
    });

    console.log(
      "[BFF GET /api/wallets] Backend response status:",
      response.status,
      "data preview:",
      Array.isArray(response.data?.data)
        ? `Array(length=${response.data.data.length})`
        : response.data,
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("[BFF GET /api/wallets] Error calling backend:", error);
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[BFF POST /api/wallets] Creating wallet with body:", body);

    const response = await serverApiClient.post("/wallets", body);
    console.log("[BFF POST /api/wallets] Backend create response:", response.data);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("[BFF POST /api/wallets] Error creating wallet:", error);
    return handleApiError(error);
  }
}
