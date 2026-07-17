import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TransactionAttachmentRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create<T extends Prisma.TransactionAttachmentCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionAttachmentCreateArgs>,
  ) {
    return this.prismaService.transactionAttachment.create(args);
  }

  createMany<T extends Prisma.TransactionAttachmentCreateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionAttachmentCreateManyArgs>,
  ) {
    return this.prismaService.transactionAttachment.createMany(args);
  }

  findUnique<T extends Prisma.TransactionAttachmentFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionAttachmentFindUniqueArgs>,
  ) {
    return this.prismaService.transactionAttachment.findUnique(args);
  }

  findFirst<T extends Prisma.TransactionAttachmentFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionAttachmentFindFirstArgs>,
  ) {
    return this.prismaService.transactionAttachment.findFirst(args);
  }

  findMany<T extends Prisma.TransactionAttachmentFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionAttachmentFindManyArgs>,
  ) {
    return this.prismaService.transactionAttachment.findMany(args);
  }

  update<T extends Prisma.TransactionAttachmentUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionAttachmentUpdateArgs>,
  ) {
    return this.prismaService.transactionAttachment.update(args);
  }

  updateMany<T extends Prisma.TransactionAttachmentUpdateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionAttachmentUpdateManyArgs>,
  ) {
    return this.prismaService.transactionAttachment.updateMany(args);
  }

  delete<T extends Prisma.TransactionAttachmentDeleteArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionAttachmentDeleteArgs>,
  ) {
    return this.prismaService.transactionAttachment.delete(args);
  }

  deleteMany<T extends Prisma.TransactionAttachmentDeleteManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionAttachmentDeleteManyArgs>,
  ) {
    return this.prismaService.transactionAttachment.deleteMany(args);
  }

  count<T extends Prisma.TransactionAttachmentCountArgs>(
    args?: Prisma.SelectSubset<T, Prisma.TransactionAttachmentCountArgs>,
  ) {
    return this.prismaService.transactionAttachment.count(args);
  }

  aggregate<T extends Prisma.TransactionAttachmentAggregateArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionAttachmentAggregateArgs>,
  ) {
    return this.prismaService.transactionAttachment.aggregate(args);
  }

  groupBy(args: Prisma.TransactionAttachmentGroupByArgs) {
    return this.prismaService.transactionAttachment.groupBy({
      ...args,
      orderBy: args.orderBy,
    });
  }
  get prisma() {
    return this.prismaService;
  }
}
