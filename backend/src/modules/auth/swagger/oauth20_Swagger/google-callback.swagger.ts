import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function ApiGoogleCallbackSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Google OAuth Callback',
      description:
        'Google tự động gọi API này sau khi người dùng xác thực thành công.',
    }),

    ApiQuery({
      name: 'code',
      required: true,
      description: 'Authorization code do Google trả về',
      example: '4/0AQSTgQ...',
    }),

    ApiQuery({
      name: 'state',
      required: false,
      description: 'Device ID được truyền từ frontend',
      example: 'device-001',
    }),

    ApiResponse({
      status: 302,
      description: 'Redirect về Frontend sau khi đăng nhập thành công',
    }),

    ApiResponse({
      status: 401,
      description: 'Xác thực Google thất bại',
    }),
  );
}
