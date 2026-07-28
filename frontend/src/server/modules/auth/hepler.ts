export function parseExpiresIn(expiresIn: string): number {
  const value = parseInt(expiresIn, 10);
  const unit = expiresIn.replace(/[0-9]/g, "");

  switch (unit) {
    case "s":
      return value; // giây
    case "m":
      return value * 60; // phút → giây
    case "h":
      return value * 3600; // giờ → giây
    case "d":
      return value * 86400; // ngày → giây
    default:
      return value; // mặc định là giây
  }
}
