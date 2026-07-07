export const CSRF_COOKIE_NAME = 'XSRF-TOKEN';

export const CSRF_HEADER_NAMES = [
  'x-xsrf-token',
  'x-csrf-token',
  'csrf-token',
] as const;

export const CSRF_COOKIE_MAX_AGE = 1000 * 60 * 60 * 24; // 24 hours

export const CSRF_COOKIE_OPTIONS = {
  httpOnly: false, // Client cần đọc để gửi lại
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: CSRF_COOKIE_MAX_AGE,
  path: '/',
};
