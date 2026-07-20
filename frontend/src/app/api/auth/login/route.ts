import { serverApiClient } from "@/src/lib/bff/server-api-client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const api = serverApiClient(req);

    const result = await api.post("/auth/login", body);

    return NextResponse.json(result.data);
  } catch (error: any) {
    console.error("[BFF LOGIN ERROR]", error.response?.data ?? error);

    return NextResponse.json(
      {
        message: error.response?.data?.message ?? "Login failed",
      },
      {
        status: error.response?.status ?? 500,
      },
    );
  }
}
