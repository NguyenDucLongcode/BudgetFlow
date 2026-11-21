import { NextRequest, NextResponse } from "next/server";
import { serverApiClient } from "@/src/lib/bff/server-api-client";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "100";
    const search = searchParams.get("search");
    const type = searchParams.get("type");

    const queryParams: Record<string, string> = {
      page,
      limit,
    };

    if (search) queryParams.search = search;
    if (type && type !== "ALL") queryParams.type = type;

    const response = await serverApiClient.get("/categories", {
      params: queryParams,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}
