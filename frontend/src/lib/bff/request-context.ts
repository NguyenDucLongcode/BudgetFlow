import { NextRequest } from "next/server";

export function getRequestContext(request: NextRequest) {
  return {
    deviceId: request.headers.get("x-device-id"),
    authorization: request.headers.get("authorization"),
    cookie: request.headers.get("cookie"),
  };
}
