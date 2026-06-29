import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ResgisterAuthDto } from '../../dto/resgister-auth.dto';

export function ApiAuthRegisterSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Đăng ký tài khoản',
      description: 'Đăng ký tài khoản mới và gửi email xác thực.',
    }),

    ApiBody({
      type: ResgisterAuthDto,
      examples: {
        example: {
          summary: 'Ví dụ đăng ký',
          value: {
            name: 'Nguyen Duc Long',
            email: 'user@gmail.com',
            password: 'Longxem1234@',
            confirmPassword: 'Longxem1234@',
          },
        },
      },
    }),

    ApiCreatedResponse({
      description: 'Đăng ký thành công',
      schema: {
        example: {
          message:
            'Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản.',
          data: {
            id: 'uuid',
            email: 'user@gmail.com',
            name: 'Nguyen Duc Long',
            role: 'USER',
            isActive: false,
            createdAt: '2026-06-29T10:00:00.000Z',
          },
        },
      },
    }),

    ApiConflictResponse({
      description: 'Email đã tồn tại',
      schema: {
        example: {
          statusCode: 409,
          message: 'Email đã tồn tại',
        },
      },
    }),
  );
}
