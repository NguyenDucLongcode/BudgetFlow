import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiAuthSwaggerUI } from 'src/common/decorators/swagger-auth.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CheckPolicies } from 'src/core/security/casl/policies/check-policies.decorator';
import { Action } from 'src/core/security/casl/actions.enum';
import { NotificationService } from './notification.service';
import { BroadcastNotificationDto } from './dto/BroadcastNotificationDto';
import { NotificationQueryDto } from './dto/NotificationQueryDto';

@ApiTags('Admin Notifications')
@ApiAuthSwaggerUI()
@Controller('admin/notifications')
@CheckPolicies((ability) => ability.can(Action.Manage, 'all'))
export class AdminNotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('broadcast')
  broadcast(
    @CurrentUser('sub') adminId: string,
    @Body() dto: BroadcastNotificationDto,
  ) {
    return this.notificationService.broadcast(adminId, dto);
  }

  @Get('history')
  history(@Query() query: NotificationQueryDto) {
    return this.notificationService.getBroadcastHistory(
      query.page,
      query.limit,
    );
  }
}
