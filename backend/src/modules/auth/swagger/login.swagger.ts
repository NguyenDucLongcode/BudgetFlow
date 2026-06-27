import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginDto } from '../dto/login.dto';

export function ApiAuthLoginSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Đăng nhập vào hệ thống',
      description:
        'User đăng nhập bằng email và password để nhận access token và refresh token',
    }),

    ApiBody({
      type: LoginDto,
      description: 'Thông tin đăng nhập',
      examples: {
        'example-1': {
          summary: 'Ví dụ đăng nhập thành công',
          value: {
            email: 'user@gmail.com',
            password: 'Longxem1234@',
          },
        },
      },
    }),

    ApiHeader({
      name: 'x-device-id',
      description: 'ID thiết bị (bắt buộc)',
      required: true,
      example: 'device-001',
    }),

    ApiOkResponse({
      description: 'Đăng nhập thành công',
      schema: {
        example: {
          message: 'Đăng nhập thành công',
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

    ApiBadRequestResponse({
      description: 'Thiếu device id hoặc dữ liệu không hợp lệ',
      schema: {
        example: {
          statusCode: 400,
          message: ['x-device-id is required'],
          timestamp: '2026-06-26T09:20:00.000Z',
          path: '/auth/login',
        },
      },
    }),

    ApiUnauthorizedResponse({
      description: 'Thông tin đăng nhập không hợp lệ',
      schema: {
        example: {
          statusCode: 401,
          message: 'Email hoặc mật khẩu không đúng',
          timestamp: '2026-06-26T09:20:00.000Z',
          path: '/auth/login',
        },
      },
    }),

    ApiForbiddenResponse({
      description: 'Tài khoản chưa xác thực email',
      schema: {
        example: {
          statusCode: 403,
          message: 'Tài khoản chưa được xác thực email',
          timestamp: '2026-06-26T09:20:00.000Z',
          path: '/auth/login',
        },
      },
    }),
  );
}
