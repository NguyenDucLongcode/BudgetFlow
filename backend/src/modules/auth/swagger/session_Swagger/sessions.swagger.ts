import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiAuthSessionsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy danh sách thiết bị đăng nhập',
      description:
        'Trả về danh sách tất cả các thiết bị mà người dùng đang đăng nhập.',
    }),

    ApiBearerAuth(),

    ApiOkResponse({
      description: 'Lấy danh sách session thành công',
      schema: {
        example: {
          message: 'Get sessions successfully',
          data: [
            {
              id: 'uuid',
              userId: 'user-uuid',
              deviceId: 'device-001',
              userAgent:
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/138.0.0.0',
              ipAddress: '127.0.0.1',
              lastLoginAt: '2026-06-28T08:00:00.000Z',
              lastActiveAt: '2026-06-28T08:30:00.000Z',
              createdAt: '2026-06-28T08:00:00.000Z',
            },
          ],
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
          path: '/auth/sessions',
        },
      },
    }),
  );
}
