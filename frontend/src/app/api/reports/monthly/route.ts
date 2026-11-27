import { NextRequest, NextResponse } from "next/server";
import { serverApiClient } from "@/src/lib/bff/server-api-client";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    const params: Record<string, string> = {};
    if (year) params.year = year;
    if (month) params.month = month;

    const response = await serverApiClient.get("/reports/monthly", { params });
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}
