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

import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreateTransactionDto } from './dto/CreateTransactionDto';
import { UpdateTransactionDto } from './dto/UpdateTransactionDto';
import { CheckPolicies } from 'src/core/security/casl/policies/check-policies.decorator';
import { Action } from 'src/core/security/casl/actions.enum';
import { PaginationTransactionDto } from './dto/PaginationTransactionDto';
import { ApiAuthSwaggerUI } from 'src/common/decorators/swagger-auth.decorator';
import { TransactionService } from './transaction.service';

@ApiTags('Transaction')
@ApiAuthSwaggerUI()
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, 'Transaction'))
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionService.create(userId, dto);
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Transaction'))
  update(
    @Param('id', ParseUUIDPipe) transactionId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionService.update(transactionId, userId, dto);
  }

  @Get()
  findAll(
    @CurrentUser('sub') userId: string,
    @Query() query: PaginationTransactionDto,
  ) {
    return this.transactionService.findAll(userId, query);
  }

  @Get('statistics')
  getStatistics(
    @CurrentUser('sub') userId: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.transactionService.getStatistics(userId, fromDate, toDate);
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Transaction'))
  findOne(
    @Param('id', ParseUUIDPipe) transactionId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.transactionService.findOne(transactionId, userId);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Transaction'))
  remove(
    @Param('id', ParseUUIDPipe) transactionId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.transactionService.remove(transactionId, userId);
  }
}
