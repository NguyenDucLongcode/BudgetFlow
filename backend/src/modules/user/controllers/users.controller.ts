import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';

import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserUpdateProfileDto } from '../dto/user/user_update-profile.dto';
import { CheckPolicies } from 'src/casl/policies/check-policies.decorator';
import { Action } from 'src/casl/actions.enum';
import { ChangePasswordDto } from '../dto/user/change-password.dto';
import { UserService } from '../services/user.service';
import { SessionService } from 'src/modules/session/session.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
  ) {}

  // =====================================================
  // USER
  // =====================================================

  // Lấy thông tin cá nhân
  @Get('me')
  @CheckPolicies((ability) => ability.can(Action.Read, 'User'))
  getProfile(@CurrentUser('sub') userId: string) {
    return this.userService.getProfile(userId);
  }

  // Cập nhật thông tin cá nhân
  @Patch('me')
  @CheckPolicies((ability) => ability.can(Action.Update, 'User'))
  updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UserUpdateProfileDto,
  ) {
    return this.userService.updateProfile(userId, dto);
  }

  // Đổi mật khẩu
  @Patch('me/change-password')
  @CheckPolicies((ability) => ability.can(Action.Update, 'User'))
  changePassword(
    @CurrentUser('sub') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(userId, dto);
  }

  // // Upload avatar (làm sau)
  // @Patch('me/avatar')
  // uploadAvatar(@CurrentUser('sub') userId: string) {
  //   return this.usersService.uploadAvatar(userId);
  // }

  // =====================================================
  // SESSIONS
  // =====================================================

  // Danh sách thiết bị đã đăng nhập
  @Get('me/sessions')
  getSessions(@CurrentUser('sub') userId: string) {
    return this.sessionService.getSessions(userId);
  }

  // Đăng xuất 1 thiết bị// Thu hồi 1 thiết bị
  @Delete('me/sessions/:sessionId')
  async revokeSession(
    @CurrentUser('sub') userId: string,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ) {
    // 1. Xóa session trong database và redis
    await this.sessionService.removeSession(userId, sessionId);

    return {
      message: 'Thu hồi phiên đăng nhập thành công.',
    };
  }

  // Thu hồi tất cả thiết bị
  @Delete('me/sessions')
  async revokeAllSessions(@CurrentUser('sub') userId: string) {
    await this.sessionService.revokeAllUserSessions(userId);

    return {
      message: 'Đã thu hồi tất cả phiên đăng nhập.',
    };
  }
}
