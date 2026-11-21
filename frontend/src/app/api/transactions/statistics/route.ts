import { NextRequest, NextResponse } from "next/server";
import { serverApiClient } from "@/src/lib/bff/server-api-client";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    const queryParams: Record<string, string> = {};
    if (fromDate) queryParams.fromDate = fromDate;
    if (toDate) queryParams.toDate = toDate;

    const response = await serverApiClient.get("/transactions/statistics", {
      params: queryParams,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}
