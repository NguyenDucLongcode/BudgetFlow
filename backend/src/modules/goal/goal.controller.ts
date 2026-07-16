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
import { GoalService } from './goal.service';

@ApiTags('Goal')
@ApiAuthSwaggerUI()
@Controller('goals')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

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
}
