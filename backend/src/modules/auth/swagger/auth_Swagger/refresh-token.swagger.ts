import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiAuthRefreshTokenSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Làm mới access token',
      description:
        'API sử dụng refresh token được lưu trong cookie để cấp access token mới.',
    }),

    ApiCookieAuth(
      'refresh_token', // tên cookie
    ),

    ApiHeader({
      name: 'x-device-id',
      description: 'ID thiết bị đã đăng nhập',
      required: true,
      example: 'device-001',
    }),

    ApiOkResponse({
      description: 'Làm mới token thành công',
      schema: {
        example: {
          message: 'Refresh token success',
          data: {
            accessToken: 'eyJ...',
            tokenType: 'Bearer',
            expiresIn: '15m',
            user: {
              id: 'uuid',
              email: 'user@gmail.com',
              name: 'Nguyen Van A',
              role: 'USER',
            },
          },
        },
      },
    }),

    ApiUnauthorizedResponse({
      description: 'Refresh token không tồn tại, hết hạn hoặc không hợp lệ',
      schema: {
        example: {
          statusCode: 401,
          message: 'Invalid refresh token',
          timestamp: '2026-06-28T08:20:00.000Z',
          path: '/auth/refresh-token',
        },
      },
    }),
  );
}
