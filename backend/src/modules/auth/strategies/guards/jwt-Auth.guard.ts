import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IVerifyOptions } from 'passport-local';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';

@Injectable()
export class JWTAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const url = req.originalUrl;

    // Kiểm tra endpoint public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Bỏ qua metrics
    const apiPrefix = process.env.VERSION_API ?? 'api/v1';

    if (url.startsWith(`/${apiPrefix}/metrics`)) {
      return true;
    }

    // Kiểm tra Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Không tìm thấy Authorization header.');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Authorization header phải có dạng: Bearer <token>',
      );
    }

    // Passport sẽ tự xử lý token
    const jwtResult = await super.canActivate(context);

    return !!jwtResult;
  }
  // Override để tùy chỉnh thông báo lỗi
  handleRequest<TUser = any>(
    err: Error | null,
    user: TUser,
    info: IVerifyOptions | string | undefined,
  ): TUser {
    if (err || !user) {
      const infoMessage = typeof info === 'string' ? info : info?.message;
      let message = 'Không thể xác thực người dùng.';

      switch (infoMessage) {
        case 'jwt expired':
          message = 'Token đã hết hạn, vui lòng đăng nhập lại.';
          break;
        case 'invalid token':
          message = 'Token không hợp lệ.';
          break;
        case 'No auth token':
          message = 'Không tìm thấy token trong header.';
          break;
        default:
          if (infoMessage) {
            message = `Authentication failed: ${infoMessage}`;
          }
      }

      throw new UnauthorizedException(message);
    }

    return user;
  }
}
