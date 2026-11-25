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
import { CreateDebtDto } from './dto/CreateDebtDto';
import { UpdateDebtDto } from './dto/UpdateDebtDto';
import { PaginationDebtDto } from './dto/PaginationDebtDto';
import { CreatePaymentForDebtDto } from './dto/CreatePaymentForDebtDto';
import { DebtService } from './debt.service';

@ApiTags('Debt')
@ApiAuthSwaggerUI()
@Controller('debts')
export class DebtController {
  constructor(private readonly debtService: DebtService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, 'Debt'))
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateDebtDto) {
    return this.debtService.create(userId, dto);
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Debt'))
  update(
    @Param('id', ParseUUIDPipe) debtId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateDebtDto,
  ) {
    return this.debtService.update(debtId, userId, dto);
  }

  @Get()
  findAll(
    @CurrentUser('sub') userId: string,
    @Query() query: PaginationDebtDto,
  ) {
    return this.debtService.findAll(userId, query);
  }

  @Get('summary')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Debt'))
  summary(@CurrentUser('sub') userId: string) {
    return this.debtService.summary(userId);
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Debt'))
  findOne(
    @Param('id', ParseUUIDPipe) debtId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.debtService.findOne(debtId, userId);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Debt'))
  remove(
    @Param('id', ParseUUIDPipe) debtId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.debtService.remove(debtId, userId);
  }

  @Post(':id/payments')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Debt'))
  addPayment(
    @Param('id', ParseUUIDPipe) debtId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreatePaymentForDebtDto,
  ) {
    return this.debtService.addPayment(debtId, userId, dto);
  }

  @Get(':id/payments')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Debt'))
  getPayments(
    @Param('id', ParseUUIDPipe) debtId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.debtService.getPayments(debtId, userId);
  }
}
