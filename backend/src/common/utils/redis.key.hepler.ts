export function getRefreshKey(userId: string, deviceId: string) {
  return `auth:refresh:${userId}:${deviceId}`;
}
