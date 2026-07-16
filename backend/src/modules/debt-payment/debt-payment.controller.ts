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
import { CreateDebtPaymentDto } from './dto/CreateDebtPaymentDto';
import { UpdateDebtPaymentDto } from './dto/UpdateDebtPaymentDto';
import { PaginationDebtPaymentDto } from './dto/PaginationDebtPaymentDto';
import { DebtPaymentService } from './debt-payment.service';

@ApiTags('Debt Payment')
@ApiAuthSwaggerUI()
@Controller('debt-payments')
export class DebtPaymentController {
  constructor(private readonly debtPaymentService: DebtPaymentService) {}

  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, 'DebtPayment'))
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateDebtPaymentDto,
  ) {
    return this.debtPaymentService.create(userId, dto);
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can(Action.Update, 'DebtPayment'))
  update(
    @Param('id', ParseUUIDPipe) debtPaymentId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateDebtPaymentDto,
  ) {
    return this.debtPaymentService.update(debtPaymentId, userId, dto);
  }

  @Get()
  findAll(
    @CurrentUser('sub') userId: string,
    @Query() query: PaginationDebtPaymentDto,
  ) {
    return this.debtPaymentService.findAll(userId, query);
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can(Action.Read, 'DebtPayment'))
  findOne(
    @Param('id', ParseUUIDPipe) debtPaymentId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.debtPaymentService.findOne(debtPaymentId, userId);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can(Action.Delete, 'DebtPayment'))
  remove(
    @Param('id', ParseUUIDPipe) debtPaymentId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.debtPaymentService.remove(debtPaymentId, userId);
  }
}
