import { NextResponse } from "next/server";
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
