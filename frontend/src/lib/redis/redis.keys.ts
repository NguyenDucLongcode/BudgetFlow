export const RedisKeys = {
  accessToken: (deviceId: string) => `bff:access:device:${deviceId}`,

  csrf: (sessionId: string) => `bff:csrf:${sessionId}`,
} as const;
