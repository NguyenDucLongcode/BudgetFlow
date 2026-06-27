export function getRefreshKey(userId: string, deviceId: string) {
  return `refresh:${userId}:${deviceId}`;
}
