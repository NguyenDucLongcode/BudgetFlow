import helmet, { HelmetOptions } from 'helmet';
import { RequestHandler } from 'express';

export const helmetOptions: HelmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
      styleSrc: ["'self'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
};

// ✅ Đây là một HÀM FACTORY, giống cookieParser()
export const useHelmet = (): RequestHandler => {
  return helmet(helmetOptions) as RequestHandler;
};
