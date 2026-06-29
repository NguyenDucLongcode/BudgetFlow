import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function ApiGoogleAuthSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Đăng nhập bằng Google',
      description: 'Chuyển hướng người dùng đến trang đăng nhập Google OAuth2.',
    }),

    ApiQuery({
      name: 'deviceId',
      required: true,
      description: 'ID thiết bị của người dùng',
      example: 'device-001',
    }),

    ApiResponse({
      status: 302,
      description: 'Redirect đến trang đăng nhập Google',
    }),
  );
}
