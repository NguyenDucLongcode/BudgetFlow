export const CSRF_COOKIE_NAME = 'XSRF-TOKEN';

export const CSRF_HEADER_NAMES = [
  'x-xsrf-token',
  'x-csrf-token',
  'csrf-token',
] as const;

export const CSRF_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days (seconds)

export const CSRF_COOKIE_OPTIONS = {
  httpOnly: false, // Client cần đọc để gửi lại
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: CSRF_COOKIE_MAX_AGE,
  path: '/',
};
