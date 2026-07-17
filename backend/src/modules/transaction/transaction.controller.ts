import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
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
import { TransactionService } from './services/transaction.service';
import { TransactionTagService } from './services/transaction-tag.service';
import { TransactionAttachmentService } from './services/transaction.attachment.service';
import { CreateAttachmentDto } from './dto/CreateAttachmentDto';
import { UpdateAttachmentDto } from './dto/UpdateAttachmentDto';

@ApiTags('Transaction')
@ApiAuthSwaggerUI()
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly transactionTagService: TransactionTagService,
    private readonly transactionAttachmentService: TransactionAttachmentService,
  ) {}

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

  // =========================
  // TAG MANAGEMENT
  // =========================

  @Post(':id/tags')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Transaction'))
  addTags(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body('tagIds') tagIds: string[],
  ) {
    return this.transactionTagService.addTags(id, userId, tagIds);
  }

  @Delete(':id/tags/:tagId')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Transaction'))
  removeTag(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('tagId', ParseUUIDPipe) tagId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.transactionTagService.removeTag(id, tagId, userId);
  }

  @Put(':id/tags')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Transaction'))
  updateTags(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body('tagIds') tagIds: string[],
  ) {
    return this.transactionTagService.updateTags(id, userId, tagIds);
  }

  @Get(':id/tags')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Transaction'))
  getTags(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.transactionTagService.getTags(id, userId);
  }

  // =========================
  // ATTACHMENT MANAGEMENT
  // =========================

  @Post(':id/attachments')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Transaction'))
  addAttachment(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateAttachmentDto,
  ) {
    return this.transactionAttachmentService.addAttachment(id, userId, dto);
  }

  @Get(':id/attachments')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Transaction'))
  getAttachments(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.transactionAttachmentService.getAttachments(id, userId);
  }

  @Get(':id/attachments/:attachmentId')
  @CheckPolicies((ability) => ability.can(Action.Read, 'Transaction'))
  getAttachment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.transactionAttachmentService.getAttachment(
      id,
      attachmentId,
      userId,
    );
  }

  @Delete(':id/attachments/:attachmentId')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Transaction'))
  removeAttachment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.transactionAttachmentService.removeAttachment(
      id,
      attachmentId,
      userId,
    );
  }

  @Delete(':id/attachments')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Transaction'))
  clearAttachments(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.transactionAttachmentService.clearAttachments(id, userId);
  }

  @Patch(':id/attachments/:attachmentId')
  @CheckPolicies((ability) => ability.can(Action.Update, 'Transaction'))
  updateAttachment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateAttachmentDto,
  ) {
    return this.transactionAttachmentService.updateAttachment(
      id,
      attachmentId,
      userId,
      dto,
    );
  }
}
