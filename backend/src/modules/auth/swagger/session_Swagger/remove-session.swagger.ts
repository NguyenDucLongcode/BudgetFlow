import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiAuthRemoveSessionSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Đăng xuất một thiết bị cụ thể',
      description:
        'Thu hồi refresh token và xóa session của một thiết bị cụ thể.',
    }),

    ApiBearerAuth(),

    ApiParam({
      name: 'deviceId',
      description: 'ID của thiết bị cần đăng xuất',
      example: 'device-001',
    }),

    ApiOkResponse({
      description: 'Xóa session thành công',
      schema: {
        example: {
          message: 'Session removed successfully',
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
          path: '/auth/sessions/device-001',
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
          path: '/auth/sessions/device-001',
        },
      },
    }),
  );
}
