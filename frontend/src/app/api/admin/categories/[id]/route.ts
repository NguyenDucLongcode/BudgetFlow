import { NextRequest, NextResponse } from "next/server";
import { serverApiClient } from "@/src/lib/bff/server-api-client";
import { handleApiError } from "@/src/lib/bff/errors/handle-api-error";
import { getCsrfToken } from "@/src/lib/bff/utils/csrf";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const csrfToken = await getCsrfToken(request);
    const res = await serverApiClient.patch<any>(
      `/categories/${id}`,
      body,
      csrfToken
        ? {
            headers: {
              "x-xsrf-token": csrfToken,
            },
          }
        : undefined,
    );
    return NextResponse.json(res.data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const csrfToken = await getCsrfToken(request);
    const res = await serverApiClient.delete<any>(
      `/categories/${id}`,
      csrfToken
        ? {
            headers: {
              "x-xsrf-token": csrfToken,
            },
          }
        : undefined,
    );
    return NextResponse.json(res.data);
  } catch (error) {
    return handleApiError(error);
  }
}
