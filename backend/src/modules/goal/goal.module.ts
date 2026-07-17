import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { GoalController } from './goal.controller';
import { GoalService } from './services/goal.service';
import { GoalContributionService } from './services/goal-contribution.service';

@Module({
  imports: [PrismaModule],
  controllers: [GoalController],
  providers: [GoalService, GoalContributionService],
  exports: [GoalService, GoalContributionService],
})
export class GoalModule {}
