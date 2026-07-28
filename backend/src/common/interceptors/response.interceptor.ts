import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';

// Interface định nghĩa cấu trúc response trả về sau khi được xử lý qua interceptor
export interface ResponseFormat<T> {
  statusCode: number; // Mã trạng thái HTTP
  message: string; // Thông điệp phản hồi
  data: T; // Dữ liệu thực tế trả về từ controller
  timestamp: string; // Thời điểm xử lý request
  path: string; // Đường dẫn của request
}

interface ResultWithMessageAndData {
  message: string;
  data: unknown;
}

interface ResultWithMessage {
  message: string;
}

@Injectable()
// ResponseInterceptor giúp đồng bộ hóa format của response trả về từ tất cả các endpoint
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ResponseFormat<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ResponseFormat<T>> {
    // Lấy thông tin request và response từ context
    const host = context.switchToHttp();
    const response = host.getResponse<Response>();
    const request = host.getRequest<Request>();

    // Gắn thêm metadata vào response: statusCode, timestamp, path
    return next.handle().pipe(
      map((result: T): ResponseFormat<T> => {
        // Case 1: controller return { message, data }
        if (
          result &&
          typeof result === 'object' &&
          'message' in result &&
          'data' in result
        ) {
          const typedResult = result as ResultWithMessageAndData;
          return {
            statusCode: response.statusCode,
            message: typedResult.message,
            data: typedResult.data as T,
            timestamp: new Date().toISOString(),
            path: request.url,
          };
        }

        // Case 2: controller return chỉ { message } (không có data)
        if (result && typeof result === 'object' && 'message' in result) {
          const typedResult = result as ResultWithMessage;
          return {
            statusCode: response.statusCode,
            message: typedResult.message,
            data: undefined as T, // data sẽ là undefined
            timestamp: new Date().toISOString(),
            path: request.url,
          };
        }

        // Case 3: controller return data trực tiếp (object, array, string, number, etc.)
        return {
          statusCode: response.statusCode,
          message: 'Success',
          data: result,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
}
