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

    // Khai báo message với kiểu an toàn
    let message: string | string[] | undefined;

    // Nếu exception trả về object chứa message (thường từ class-validator)
    if (typeof res === 'object' && res !== null && 'message' in res) {
      const resObj = res as Record<string, unknown>;
      const msg = resObj.message;
      if (typeof msg === 'string' || Array.isArray(msg)) {
        message = msg;
      }
    } else if (typeof res === 'string') {
      message = res;
    }

    // Hiện logger khi lỗi
    logger.error({
      method: request.method,
      url: request.url,
      status,
      message: exception.message,
      stack: exception.stack,
    });

    // Trả về response cho client
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
