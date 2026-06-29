import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiAuthLogoutAllSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Đăng xuất khỏi tất cả thiết bị',
      description:
        'Thu hồi toàn bộ refresh token, xóa tất cả session và tăng tokenVersion để vô hiệu hóa mọi access token.',
    }),

    ApiBearerAuth(),

    ApiOkResponse({
      description: 'Đăng xuất tất cả thiết bị thành công',
      schema: {
        example: {
          message: 'Logout all devices successfully',
        },
      },
    }),

    ApiUnauthorizedResponse({
      description: 'Access token không hợp lệ hoặc đã hết hạn',
      schema: {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
          timestamp: '2026-06-28T08:20:00.000Z',
          path: '/auth/logout-all',
        },
      },
    }),
  );
}
