import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

export function ApiForgotPasswordSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Quên mật khẩu',
      description: 'Gửi email chứa đường dẫn đặt lại mật khẩu.',
    }),

    ApiBody({
      schema: {
        example: {
          email: 'user@gmail.com',
        },
      },
    }),

    ApiOkResponse({
      description: 'Gửi email thành công',
      schema: {
        example: {
          message:
            'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.',
        },
      },
    }),
  );
}
