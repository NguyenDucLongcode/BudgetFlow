// common/modules/csrf/csrf.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CsrfService } from '../csrf.service';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  constructor(private csrfService: CsrfService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Chỉ set cookie cho GET requests (lần đầu)
    // và chỉ khi chưa có cookie
    const isGetRequest = req.method === 'GET';
    const hasCsrfCookie = !!req.cookies?.[this.csrfService.getCookieName()];

    if (isGetRequest && !hasCsrfCookie) {
      this.csrfService.setCsrfCookie(res);
    }

    next();
  }
}
