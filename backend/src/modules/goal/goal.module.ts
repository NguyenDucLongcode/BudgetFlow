import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';
import { GoalController } from './goal.controller';
import { GoalService } from './services/goal.service';
import { GoalContributionService } from './services/goal-contribution.service';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [GoalController],
  providers: [GoalService, GoalContributionService],
  exports: [GoalService, GoalContributionService],
})
export class GoalModule {}
