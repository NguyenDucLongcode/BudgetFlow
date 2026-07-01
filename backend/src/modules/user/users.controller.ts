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
} from '@nestjs/common';
// import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CheckPolicies } from 'src/casl/policies/check-policies.decorator';
import { Action } from 'src/casl/actions.enum';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserService } from './user.service';
import { AdminService } from './admin.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UserService,
    private readonly adminService: AdminService,
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
    @Body() dto: UpdateProfileDto,
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
  // ADMIN
  // =====================================================

  // Danh sách user
  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  // Tổng số user
  @Get('count')
  count() {
    return this.adminService.count();
  }

  // Chi tiết user
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.findOne(id);
  }

  // Admin cập nhật user
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.adminService.update(id, dto);
  }

  // Khóa / mở khóa tài khoản
  @Patch(':id/toggle-active')
  @CheckPolicies((ability) => ability.can(Action.Update, 'User'))
  toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.toggleActive(id);
  }

  // Xóa user
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @CheckPolicies((ability) => ability.can(Action.Update, 'User'))
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteAccount(id);
  }
}
