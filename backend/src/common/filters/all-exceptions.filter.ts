import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '@nestjs/common';

const logger = new Logger('ExceptionFilter');

@Catch(HttpException)
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Lấy dữ liệu phản hồi từ exception
    const res = exception.getResponse();

    // Xác định message và type của lỗi
    let message: string | string[] = exception.message;
    let type = exception.name;

    if (typeof res === 'object' && res !== null) {
      const body = res as Record<string, unknown>;

      if ('message' in body) {
        message = body.message as string | string[];
      }

      if ('error' in body) {
        type = String(body.error);
      }
    }

    // Hiện logger khi lỗi
    logger.error({
      method: request.method,
      url: request.url,
      status,
      type,
      message: exception.message,
      stack: exception.stack,
    });

    // Trả về response cho client
    response.status(status).json({
      statusCode: status,
      type,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
