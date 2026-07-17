import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreateNotificationDto } from './dto/CreateNotificationDto';
import { NotificationQueryDto } from './dto/NotificationQueryDto';
import { CheckPolicies } from 'src/core/security/casl/policies/check-policies.decorator';
import { Action } from 'src/core/security/casl/actions.enum';
import { ApiAuthSwaggerUI } from 'src/common/decorators/swagger-auth.decorator';

@ApiTags('Notification')
@ApiAuthSwaggerUI()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, 'Notification'))
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateNotificationDto,
  ) {
    return this.notificationService.create(userId, dto);
  }

  @Get()
  @CheckPolicies((ability) => ability.can(Action.Read, 'Notification'))
  findAll(
    @CurrentUser('sub') userId: string,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notificationService.findAll(userId, query);
  }

  @Get('unread-count')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Notification'))
  countUnread(@CurrentUser('sub') userId: string) {
    return this.notificationService.countUnread(userId);
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Notification'))
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.notificationService.findOne(id, userId);
  }

  @Patch(':id/read')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Notification'))
  markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.notificationService.markAsRead(id, userId);
  }

  @Patch('mark-all-read')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Notification'))
  markAllAsRead(@CurrentUser('sub') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }

  @Patch('mark-all-unread')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Notification'))
  markAllAsUnread(@CurrentUser('sub') userId: string) {
    return this.notificationService.markAllAsUnread(userId);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Notification'))
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.notificationService.remove(id, userId);
  }

  @Delete('clear-read')
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Notification'))
  removeAll(@CurrentUser('sub') userId: string) {
    return this.notificationService.removeAll(userId);
  }
}
