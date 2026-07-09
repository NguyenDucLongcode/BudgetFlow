import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import * as crypto from 'crypto';

import {
  CSRF_COOKIE_NAME,
  CSRF_COOKIE_MAX_AGE,
  CSRF_HEADER_NAMES,
  CSRF_COOKIE_OPTIONS,
} from '../../../common/constants/csrf.constants';

@Injectable()
export class CsrfService {
  /**
   * Generate random CSRF token
   */
  generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Compare two tokens using timing-safe comparison
   */
  compare(cookieToken: string, headerToken: string): boolean {
    if (!cookieToken || !headerToken) {
      return false;
    }

    if (cookieToken.length !== headerToken.length) {
      return false;
    }

    try {
      return crypto.timingSafeEqual(
        Buffer.from(cookieToken, 'utf8'),
        Buffer.from(headerToken, 'utf8'),
      );
    } catch {
      return false;
    }
  }

  /**
   * Set CSRF cookie and return token
   */
  setCsrfCookie(res: Response): string {
    const token = this.generateToken();

    res.cookie(CSRF_COOKIE_NAME, token, CSRF_COOKIE_OPTIONS);

    return token;
  }

  /**
   * Get CSRF cookie name
   */
  getCookieName(): string {
    return CSRF_COOKIE_NAME;
  }

  /**
   * Get CSRF header names
   */
  getHeaderNames(): readonly string[] {
    return CSRF_HEADER_NAMES;
  }

  /**
   * Get cookie max age
   */
  getCookieMaxAge(): number {
    return CSRF_COOKIE_MAX_AGE;
  }

  /**
   * Extract CSRF token from request
   */
  extractToken(req: Request): string | undefined {
    // 1. Check headers
    for (const headerName of CSRF_HEADER_NAMES) {
      const token = req.headers[headerName] as string | undefined;
      if (token) {
        return token;
      }
    }

    // 2. Check body (fallback)
    const bodyToken = req.body?._csrf as string | undefined;
    if (bodyToken) {
      return bodyToken;
    }

    // 3. Check query params (fallback)
    const queryToken = req.query?._csrf as string | undefined;
    if (queryToken) {
      return queryToken;
    }

    return undefined;
  }

  /**
   * Extract cookie token from request
   */
  extractCookieToken(req: Request): string | undefined {
    return req.cookies?.[CSRF_COOKIE_NAME] as string | undefined;
  }

  /**
   * Validate CSRF token from request
   */
  validate(req: Request): boolean {
    const cookieToken = this.extractCookieToken(req);
    const headerToken = this.extractToken(req);

    if (!cookieToken || !headerToken) {
      return false;
    }

    return this.compare(cookieToken, headerToken);
  }

  /**
   * Clear CSRF cookie
   */
  clearCsrfCookie(res: Response): void {
    res.clearCookie(CSRF_COOKIE_NAME, {
      path: CSRF_COOKIE_OPTIONS.path,
    });
  }
}
