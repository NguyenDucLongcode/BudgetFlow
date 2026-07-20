export const RedisKeys = {
  accessToken: (sessionId: string) => `bff:access:${sessionId}`,

  csrf: (sessionId: string) => `bff:csrf:${sessionId}`,
} as const;
