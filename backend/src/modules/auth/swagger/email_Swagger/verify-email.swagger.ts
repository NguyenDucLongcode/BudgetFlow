import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiVerifyEmailSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Xác thực email',
      description: 'Kích hoạt tài khoản thông qua token được gửi trong email.',
    }),

    ApiQuery({
      name: 'token',
      required: true,
      example:
        '8a1a3a8ede8369610e4c58ae99cf21ceb91cd6257dbdc6660b6d7cdc5a6421dc',
    }),

    ApiOkResponse({
      description: 'Xác thực thành công',
      schema: {
        example: {
          message: 'Xác thực email thành công',
        },
      },
    }),

    ApiUnauthorizedResponse({
      description: 'Token không hợp lệ hoặc đã hết hạn',
      schema: {
        example: {
          statusCode: 401,
          message: 'Token không hợp lệ hoặc đã hết hạn',
        },
      },
    }),
  );
}
