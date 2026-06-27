export interface JwtPayload {
  sub: string; // User ID (subject)
  email: string;
  role: string;
  tv: number; // Token version
  iat?: number; // Issued at (tự động thêm khi sign)
  exp?: number; // Expiration (tự động thêm khi sign)
}
