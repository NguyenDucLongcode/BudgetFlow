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
    const period = searchParams.get("period");
    const categoryId = searchParams.get("categoryId");
    const isActive = searchParams.get("isActive");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const sortBy = searchParams.get("sortBy") || "startDate";
    const order = searchParams.get("order") || "desc";

    const queryParams: Record<string, string> = {
      page,
      limit,
      sortBy,
      order,
    };

    if (search) queryParams.search = search;
    if (type && type !== "ALL") queryParams.type = type;
    if (period && period !== "ALL") queryParams.period = period;
    if (categoryId && categoryId !== "ALL") queryParams.categoryId = categoryId;
    if (isActive !== null && isActive !== undefined && isActive !== "ALL") {
      queryParams.isActive = isActive;
    }
    if (fromDate) queryParams.fromDate = fromDate;
    if (toDate) queryParams.toDate = toDate;
    if (month) queryParams.month = month;
    if (year) queryParams.year = year;

    const response = await serverApiClient.get("/budgets", {
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
    const response = await serverApiClient.post("/budgets", body);
    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}
