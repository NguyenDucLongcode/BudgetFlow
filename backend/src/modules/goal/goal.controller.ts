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
import { ApiAuthSwaggerUI } from 'src/common/decorators/swagger-auth.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Action } from 'src/core/security/casl/actions.enum';
import { CheckPolicies } from 'src/core/security/casl/policies/check-policies.decorator';
import { CreateGoalDto } from './dto/CreateGoalDto';
import { UpdateGoalDto } from './dto/UpdateGoalDto';
import { PaginationGoalDto } from './dto/PaginationGoalDto';
import { ChangeGoalSavedAmountDto } from './dto/ChangeGoalSavedAmountDto';
import { GoalService } from './services/goal.service';
import { CreateContributionDto } from './dto/CreateContributionDto';
import { GoalContributionService } from './services/goal-contribution.service';
import { ContributionQueryDto } from './dto/ContributionQueryDto';
import { UpdateContributionDto } from './dto/UpdateContributionDto';

@ApiTags('Goal')
@ApiAuthSwaggerUI()
@Controller('goals')
export class GoalController {
  constructor(
    private readonly goalService: GoalService,
    private readonly contributionService: GoalContributionService,
  ) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, 'Goal'))
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateGoalDto) {
    return this.goalService.create(userId, dto);
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Goal'))
  update(
    @Param('id', ParseUUIDPipe) goalId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.goalService.update(goalId, userId, dto);
  }

  @Get()
  findAll(
    @CurrentUser('sub') userId: string,
    @Query() query: PaginationGoalDto,
  ) {
    return this.goalService.findAll(userId, query);
  }

  @Get('summary')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Goal'))
  summary(@CurrentUser('sub') userId: string) {
    return this.goalService.summary(userId);
  }

  @Post(':id/deposit')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Goal'))
  deposit(
    @Param('id', ParseUUIDPipe) goalId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: ChangeGoalSavedAmountDto,
  ) {
    return this.goalService.adjustSavedAmount(goalId, userId, dto, 'deposit');
  }

  @Post(':id/withdraw')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Goal'))
  withdraw(
    @Param('id', ParseUUIDPipe) goalId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: ChangeGoalSavedAmountDto,
  ) {
    return this.goalService.adjustSavedAmount(goalId, userId, dto, 'withdraw');
  }

  @Patch(':id/pause')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Goal'))
  pause(
    @Param('id', ParseUUIDPipe) goalId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.goalService.pause(goalId, userId);
  }

  @Patch(':id/resume')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Goal'))
  resume(
    @Param('id', ParseUUIDPipe) goalId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.goalService.resume(goalId, userId);
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Goal'))
  findOne(
    @Param('id', ParseUUIDPipe) goalId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.goalService.findOne(goalId, userId);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Goal'))
  remove(
    @Param('id', ParseUUIDPipe) goalId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.goalService.remove(goalId, userId);
  }

  // =========================
  // CONTRIBUTION MANAGEMENT
  // =========================

  @Post(':id/contributions')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Goal'))
  addContribution(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateContributionDto,
  ) {
    return this.contributionService.addContribution(id, userId, dto);
  }

  @Get(':id/contributions')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Goal'))
  getContributions(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Query() query: ContributionQueryDto,
  ) {
    return this.contributionService.getContributions(id, userId, query);
  }

  @Get(':id/contributions/stats')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Goal'))
  getContributionStats(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.contributionService.getContributionStats(id, userId);
  }

  @Get(':id/contributions/:contributionId')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Goal'))
  getContribution(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('contributionId', ParseUUIDPipe) contributionId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.contributionService.getContribution(id, contributionId, userId);
  }

  @Patch(':id/contributions/:contributionId')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Goal'))
  updateContribution(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('contributionId', ParseUUIDPipe) contributionId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateContributionDto,
  ) {
    return this.contributionService.updateContribution(
      id,
      contributionId,
      userId,
      dto,
    );
  }

  @Delete(':id/contributions/:contributionId')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Goal'))
  removeContribution(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('contributionId', ParseUUIDPipe) contributionId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.contributionService.removeContribution(
      id,
      contributionId,
      userId,
    );
  }

  @Delete(':id/contributions')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Goal'))
  clearContributions(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.contributionService.clearContributions(id, userId);
  }
}
