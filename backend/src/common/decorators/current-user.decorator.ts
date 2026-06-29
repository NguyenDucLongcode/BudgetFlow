import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from 'src/modules/auth/strategies/type';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    // Lấy thông tin user từ request
    const request = ctx.switchToHttp().getRequest<{
      user: JwtPayload;
    }>();

    // Lấy thông tin user từ request
    const user = request.user;

    // Nếu data được cung cấp, trả về giá trị tương ứng từ user, nếu không, trả về toàn bộ user
    return data ? user[data] : user;
  },
);
