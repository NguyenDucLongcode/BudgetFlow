import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiAuthLogoutSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Đăng xuất thiết bị hiện tại',
      description:
        'Xóa refresh token của thiết bị hiện tại, xóa session trong hệ thống và xóa cookie refresh token.',
    }),

    ApiBearerAuth(),

    ApiHeader({
      name: 'x-device-id',
      description: 'ID của thiết bị hiện tại',
      required: true,
      example: 'device-001',
    }),

    ApiOkResponse({
      description: 'Đăng xuất thành công',
      schema: {
        example: {
          message: 'Logout successful',
        },
      },
    }),

    ApiBadRequestResponse({
      description: 'Thiếu device id',
      schema: {
        example: {
          statusCode: 400,
          message: 'Thiếu device id',
          timestamp: '2026-06-28T08:20:00.000Z',
          path: '/auth/logout',
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
          path: '/auth/logout',
        },
      },
    }),
  );
}
