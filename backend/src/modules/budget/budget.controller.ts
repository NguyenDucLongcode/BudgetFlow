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
import { CreateBudgetDto } from './dto/CreateBudgetDto';
import { UpdateBudgetDto } from './dto/UpdateBudgetDto';
import { PaginationBudgetDto } from './dto/PaginationBudgetDto';
import { BudgetService } from './budget.service';

@ApiTags('Budget')
@ApiAuthSwaggerUI()
@Controller('budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, 'Budget'))
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateBudgetDto) {
    return this.budgetService.create(userId, dto);
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Budget'))
  update(
    @Param('id', ParseUUIDPipe) budgetId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    return this.budgetService.update(budgetId, userId, dto);
  }

  @Get()
  findAll(
    @CurrentUser('sub') userId: string,
    @Query() query: PaginationBudgetDto,
  ) {
    return this.budgetService.findAll(userId, query);
  }

  @Get('summary')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Budget'))
  summary(
    @CurrentUser('sub') userId: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    return this.budgetService.summary(userId, {
      fromDate,
      toDate,
      month,
      year,
    });
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Budget'))
  findOne(
    @Param('id', ParseUUIDPipe) budgetId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.budgetService.findOne(budgetId, userId);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Budget'))
  remove(
    @Param('id', ParseUUIDPipe) budgetId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.budgetService.remove(budgetId, userId);
  }
}
