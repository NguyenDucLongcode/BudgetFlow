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

    // Kiểm tra xem endpoint có được đánh dấu là public không
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Nếu là endpoint public, bỏ qua tất cả các bước xác thực
    if (isPublic) {
      return true;
    }

    // Bỏ qua endpoint /metrics
    const apiPrefix = process.env.VERSION_API ?? 'api/v1';
    if (url.startsWith(`/${apiPrefix}/metrics`)) {
      return true;
    }

    // Lấy token từ header x-access-token
    const accessTokenHeader = req.headers['x-access-token'];
    if (!accessTokenHeader) {
      throw new UnauthorizedException('Không tìm thấy token trong header.');
    }

    // Xử lý trường hợp token là mảng (nếu có nhiều header cùng tên)
    let token = Array.isArray(accessTokenHeader)
      ? accessTokenHeader[0]
      : accessTokenHeader;

    if (token.startsWith('Bearer ')) {
      token = token.substring(7);
    }

    // Set token để passport-jwt sử dụng
    req.headers['x-access-token'] = token;

    // Gọi parent canActivate để xác thực JWT
    const jwtResult = await super.canActivate(context);

    // Nếu xác thực JWT thất bại
    if (!jwtResult) {
      return false;
    }

    return true;
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
