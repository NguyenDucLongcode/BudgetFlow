import { NextResponse } from "next/server";
import axios from "axios";
import { ApiError } from "@/src/types/api/api.types";

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        statusCode: error.statusCode,
        message: error.message,
        timestamp: error.timestamp,
        path: error.path,
      },
      {
        status: error.statusCode,
      },
    );
  }

  if (axios.isAxiosError(error)) {
    const data = error.response?.data as any;
    const statusCode = error.response?.status || 500;
    const message = data?.message || error.message || "Internal Server Error";
    return NextResponse.json(
      {
        statusCode,
        message,
        timestamp: new Date().toISOString(),
      },
      {
        status: statusCode,
      },
    );
  }

  console.error(error);

  return NextResponse.json(
    {
      statusCode: 500,
      message: "Internal Server Error",
      timestamp: new Date().toISOString(),
    },
    {
      status: 500,
    },
  );
}
