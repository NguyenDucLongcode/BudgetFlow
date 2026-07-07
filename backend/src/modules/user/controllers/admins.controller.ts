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
import { CheckPolicies } from 'src/casl/policies/check-policies.decorator';
import { Action } from 'src/casl/actions.enum';
import { AdminService } from '../services/admin.service';
import { AdminUpdateUserDto } from '../dto/admin/admin_update-profile.dto';
import { AdminPaginationUsersDto } from '../dto/admin/admin_pagination_query';
import { SessionService } from 'src/modules/session/session.service';

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

  @Get('dashboard')
  dashboard() {
    return this.adminService.dashboard();
  }

  // =====================================================
  // USER MANAGEMENT
  // =====================================================

  // Danh sách user
  @Get('users')
  findAll(@Query() query: AdminPaginationUsersDto) {
    return this.adminService.findAll(query);
  }

  // Chi tiết user
  @Get('users/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.findOne(id);
  }

  // Cập nhật thông tin user
  @Patch('users/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    return this.adminService.update(id, dto);
  }

  // Khóa / Mở khóa tài khoản
  @Patch('users/:id/toggle-active')
  toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.toggleActive(id);
  }

  // Xem tất cả session của user
  @Get('users/:id/sessions')
  async getUserSessions(@CurrentUser('sub') userId: string) {
    return this.sessionService.getSessions(userId);
  }

  // Thu hồi session của user
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
  @Delete('users/:id/sessions')
  @HttpCode(HttpStatus.OK)
  async revokeUserSessions(@Param('id', ParseUUIDPipe) userId: string) {
    await this.sessionService.revokeAllUserSessions(userId);

    return {
      message: 'Đã thu hồi tất cả phiên đăng nhập.',
    };
  }

  // Xóa user (Soft delete)
  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') adminId: string,
  ) {
    return this.adminService.remove(id, adminId);
  }
}
