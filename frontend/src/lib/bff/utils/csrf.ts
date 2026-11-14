import { NextRequest } from "next/server";
import { cookies, headers } from "next/headers";

/**
 * Trích xuất CSRF token từ Request headers, Server headers hoặc Cookie Store
 */
export async function getCsrfToken(req?: NextRequest): Promise<string | undefined> {
  const headerStore = await headers();
  const cookieStore = await cookies();

  return (
    req?.headers.get("x-xsrf-token") ||
    req?.headers.get("x-csrf-token") ||
    req?.headers.get("csrf-token") ||
    headerStore.get("x-xsrf-token") ||
    headerStore.get("x-csrf-token") ||
    headerStore.get("csrf-token") ||
    req?.cookies.get("XSRF-TOKEN")?.value ||
    cookieStore.get("XSRF-TOKEN")?.value ||
    undefined
  );
}
