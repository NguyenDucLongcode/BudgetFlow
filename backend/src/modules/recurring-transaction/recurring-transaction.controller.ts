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
import { CreateRecurringTransactionDto } from './dto/CreateRecurringTransactionDto';
import { UpdateRecurringTransactionDto } from './dto/UpdateRecurringTransactionDto';
import { PaginationRecurringTransactionDto } from './dto/PaginationRecurringTransactionDto';
import { RecurringTransactionService } from './recurring-transaction.service';

@ApiTags('Recurring Transaction')
@ApiAuthSwaggerUI()
@Controller('recurring-transactions')
export class RecurringTransactionController {
  constructor(
    private readonly recurringTransactionService: RecurringTransactionService,
  ) {}

  @Post()
  @CheckPolicies((ability) =>
    ability.can(Action.Create, 'RecurringTransaction'),
  )
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateRecurringTransactionDto,
  ) {
    return this.recurringTransactionService.create(userId, dto);
  }

  @Patch(':id')
  @CheckPolicies((ability) =>
    ability.can(Action.Update, 'RecurringTransaction'),
  )
  update(
    @Param('id', ParseUUIDPipe) recurringTransactionId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateRecurringTransactionDto,
  ) {
    return this.recurringTransactionService.update(
      recurringTransactionId,
      userId,
      dto,
    );
  }

  @Get()
  findAll(
    @CurrentUser('sub') userId: string,
    @Query() query: PaginationRecurringTransactionDto,
  ) {
    return this.recurringTransactionService.findAll(userId, query);
  }

  @Post(':id/mark-run')
  @CheckPolicies((ability) =>
    ability.can(Action.Update, 'RecurringTransaction'),
  )
  markRun(
    @Param('id', ParseUUIDPipe) recurringTransactionId: string,
    @CurrentUser('sub') userId: string,
    @Body('runDate') runDate?: string,
  ) {
    return this.recurringTransactionService.markAsRun(
      recurringTransactionId,
      userId,
      runDate,
    );
  }

  @Patch(':id/pause')
  @CheckPolicies((ability) =>
    ability.can(Action.Update, 'RecurringTransaction'),
  )
  pause(
    @Param('id', ParseUUIDPipe) recurringTransactionId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.recurringTransactionService.pause(
      recurringTransactionId,
      userId,
    );
  }

  @Patch(':id/resume')
  @CheckPolicies((ability) =>
    ability.can(Action.Update, 'RecurringTransaction'),
  )
  resume(
    @Param('id', ParseUUIDPipe) recurringTransactionId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.recurringTransactionService.resume(
      recurringTransactionId,
      userId,
    );
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can(Action.Read, 'RecurringTransaction'))
  findOne(
    @Param('id', ParseUUIDPipe) recurringTransactionId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.recurringTransactionService.findOne(
      recurringTransactionId,
      userId,
    );
  }

  @Delete(':id')
  @CheckPolicies((ability) =>
    ability.can(Action.Delete, 'RecurringTransaction'),
  )
  remove(
    @Param('id', ParseUUIDPipe) recurringTransactionId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.recurringTransactionService.remove(
      recurringTransactionId,
      userId,
    );
  }
}
