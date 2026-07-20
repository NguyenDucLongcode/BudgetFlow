import { NextRequest } from "next/server";
import { serverClient } from "../axios/axio-server";
import { getRequestContext } from "./request-context";

export function serverApiClient(request: NextRequest) {
  const context = getRequestContext(request);

  console.log("[BFF CONTEXT]", {
    deviceId: context.deviceId,
    cookie: context.cookie,
    userAgent: request.headers.get("user-agent"),
  });

  const client = serverClient.create({
    headers: {
      ...(context.deviceId
        ? {
            "x-device-id": context.deviceId,
          }
        : {}),

      ...(context.cookie
        ? {
            Cookie: context.cookie,
          }
        : {}),
    },
  });

  console.log("[BFF OUTGOING HEADERS]", client.defaults.headers);

  return client;
}
