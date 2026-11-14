import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CheckPolicies } from 'src/core/security/casl/policies/check-policies.decorator';
import { Action } from 'src/core/security/casl/actions.enum';
import { AdminService } from '../services/admin.service';
import { AdminUpdateUserDto } from '../dto/admin/admin_update-profile.dto';
import { AdminPaginationUsersDto } from '../dto/admin/admin_pagination_query';
import { SessionService } from 'src/modules/session/session.service';
import { RateLimit } from 'src/core/security/rate-limit/decorator/rate-limit.decorator';
import { RATE_LIMIT } from 'src/core/security/rate-limit/constants/rate-limit.constants';
import { ApiTags } from '@nestjs/swagger';
import { ApiAuthSwaggerUI } from 'src/common/decorators/swagger-auth.decorator';
import { UserStatus } from 'generated/prisma/client';

@ApiTags('Admin')
@ApiAuthSwaggerUI()
@Controller('admin')
@CheckPolicies((ability) => ability.can(Action.Manage, 'User'))
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly sessionService: SessionService,
  ) {}

  // =====================================================
  // DASHBOARD
  // =====================================================

  @RateLimit(RATE_LIMIT.ADMIN.DASHBOARD)
  @Get('dashboard')
  dashboard() {
    return this.adminService.dashboard();
  }

  // =====================================================
  // USER MANAGEMENT
  // =====================================================

  // Danh sách user
  @RateLimit(RATE_LIMIT.ADMIN.USERS)
  @Get('users')
  findAll(@Query() query: AdminPaginationUsersDto) {
    return this.adminService.findAll(query);
  }

  // Chi tiết user
  @RateLimit(RATE_LIMIT.ADMIN.USER_DETAIL)
  @Get('users/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.findOne(id);
  }

  // Cập nhật thông tin user
  @RateLimit(RATE_LIMIT.ADMIN.UPDATE_USER)
  @Patch('users/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    return this.adminService.update(id, dto);
  }

  // Khóa / Mở khóa tài khoản
  @RateLimit(RATE_LIMIT.ADMIN.TOGGLE_ACTIVE)
  @Patch('users/:id/toggle-active')
  toggleActive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status?: UserStatus,
  ) {
    return this.adminService.toggleActive(id, status);
  }

  // Xem tất cả session của user
  @RateLimit(RATE_LIMIT.ADMIN.USER_SESSIONS)
  @Get('users/:id/sessions')
  async getUserSessions(@CurrentUser('sub') userId: string) {
    return this.sessionService.getSessions(userId);
  }

  // Thu hồi session của user
  @RateLimit(RATE_LIMIT.ADMIN.REVOKE_USER_SESSION)
  @Delete('users/:userId/sessions/:sessionId')
  async revokeUserSession(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ) {
    await this.sessionService.removeSession(userId, sessionId);

    return {
      message: 'Thu hồi phiên đăng nhập thành công.',
    };
  }
  // Thu hồi toàn bộ session của user
  @RateLimit(RATE_LIMIT.ADMIN.REVOKE_ALL_USER_SESSIONS)
  @Delete('users/:id/sessions')
  @HttpCode(HttpStatus.OK)
  async revokeUserSessions(@Param('id', ParseUUIDPipe) userId: string) {
    await this.sessionService.revokeAllUserSessions(userId);

    return {
      message: 'Đã thu hồi tất cả phiên đăng nhập.',
    };
  }

  // Xóa user (Soft delete)
  @RateLimit(RATE_LIMIT.ADMIN.DELETE_USER)
  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.adminService.remove(id, adminId);
  }
}
