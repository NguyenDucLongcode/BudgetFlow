/**
 * Trích xuất giá trị cookie từ document.cookie phía client
 * @param name Tên cookie cần lấy
 * @returns Giá trị cookie hoặc undefined nếu không tìm thấy
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift()?.trim();
  }

  return undefined;
}
