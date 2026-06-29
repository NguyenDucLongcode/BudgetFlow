import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

export function ApiResendVerificationSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Gửi lại email xác thực',
      description:
        'Gửi lại email kích hoạt tài khoản nếu email chưa được xác thực.',
    }),

    ApiBody({
      schema: {
        example: {
          email: 'user@gmail.com',
        },
      },
    }),

    ApiOkResponse({
      description: 'Gửi lại email thành công',
      schema: {
        example: {
          message: 'Email xác thực đã được gửi lại',
        },
      },
    }),

    ApiConflictResponse({
      description: 'Tài khoản đã được xác thực',
      schema: {
        example: {
          statusCode: 409,
          message: 'Tài khoản đã được xác thực',
        },
      },
    }),
  );
}
