import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(ForbiddenException)
export class CsrfExceptionFilter implements ExceptionFilter {
  catch(exception: ForbiddenException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const rawMessage = exception?.message ?? '';

    if (
      rawMessage === 'invalid csrf token' ||
      rawMessage === 'invalid csrf secret'
    ) {
      return response.status(403).json({
        statusCode: 403,
        message: 'CSRF token is invalid or missing',
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    // fallback: vẫn trả về đầy đủ nếu là Forbidden nhưng không phải CSRF
    return response.status(403).json({
      statusCode: 403,
      message: rawMessage || 'Forbidden',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
