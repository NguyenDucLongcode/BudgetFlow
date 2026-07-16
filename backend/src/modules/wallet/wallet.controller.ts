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
import { WalletService } from './wallet.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreateWalletDto } from './dto/CreateWalletDto';
import { UpdateWalletDto } from './dto/UpdateWalletDto';
import { CheckPolicies } from 'src/core/security/casl/policies/check-policies.decorator';
import { Action } from 'src/core/security/casl/actions.enum';
import { PaginationDto } from './dto/PaginationDto';
import { ApiAuthSwaggerUI } from 'src/common/decorators/swagger-auth.decorator';

@ApiTags('Wallet')
@ApiAuthSwaggerUI()
@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}
  @Post()
  @CheckPolicies((ability) => ability.can(Action.Create, 'Wallet'))
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateWalletDto) {
    return this.walletService.create(userId, dto);
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Wallet'))
  update(
    @Param('id', ParseUUIDPipe) walletId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateWalletDto,
  ) {
    return this.walletService.update(walletId, userId, dto);
  }

  @Get()
  findAll(@CurrentUser('sub') userId: string, @Query() query: PaginationDto) {
    return this.walletService.findAll(userId, query);
  }

  @Get(':id')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Wallet'))
  findOne(
    @Param('id', ParseUUIDPipe) walletId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.walletService.findOne(walletId, userId);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Wallet'))
  remove(
    @Param('id', ParseUUIDPipe) walletId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.walletService.remove(walletId, userId);
  }

  @Patch(':id/set-default')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Wallet'))
  setDefault(
    @Param('id', ParseUUIDPipe) walletId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.walletService.setDefault(walletId, userId);
  }
}
