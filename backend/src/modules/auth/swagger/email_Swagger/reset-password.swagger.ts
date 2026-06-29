import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiResetPasswordSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Đặt lại mật khẩu',
      description: 'Đặt lại mật khẩu thông qua token nhận từ email.',
    }),

    ApiQuery({
      name: 'token',
      required: true,
      example:
        '8a1a3a8ede8369610e4c58ae99cf21ceb91cd6257dbdc6660b6d7cdc5a6421dc',
    }),

    ApiBody({
      schema: {
        example: {
          password: 'Longxem1234@',
          confirmPassword: 'Longxem1234@',
        },
      },
    }),

    ApiOkResponse({
      description: 'Đổi mật khẩu thành công',
      schema: {
        example: {
          message: 'Đặt lại mật khẩu thành công',
        },
      },
    }),

    ApiUnauthorizedResponse({
      description: 'Token không hợp lệ',
      schema: {
        example: {
          statusCode: 401,
          message: 'Token không hợp lệ hoặc đã hết hạn',
        },
      },
    }),
  );
}
