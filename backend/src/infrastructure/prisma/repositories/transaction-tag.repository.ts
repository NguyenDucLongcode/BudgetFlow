import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TransactionTagRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create<T extends Prisma.TransactionTagCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionTagCreateArgs>,
  ) {
    return this.prismaService.transactionTag.create(args);
  }

  createMany<T extends Prisma.TransactionTagCreateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionTagCreateManyArgs>,
  ) {
    return this.prismaService.transactionTag.createMany(args);
  }

  findUnique<T extends Prisma.TransactionTagFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionTagFindUniqueArgs>,
  ) {
    return this.prismaService.transactionTag.findUnique(args);
  }

  findFirst<T extends Prisma.TransactionTagFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionTagFindFirstArgs>,
  ) {
    return this.prismaService.transactionTag.findFirst(args);
  }

  findMany<T extends Prisma.TransactionTagFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionTagFindManyArgs>,
  ) {
    return this.prismaService.transactionTag.findMany(args);
  }

  update<T extends Prisma.TransactionTagUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionTagUpdateArgs>,
  ) {
    return this.prismaService.transactionTag.update(args);
  }

  updateMany<T extends Prisma.TransactionTagUpdateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionTagUpdateManyArgs>,
  ) {
    return this.prismaService.transactionTag.updateMany(args);
  }

  delete<T extends Prisma.TransactionTagDeleteArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionTagDeleteArgs>,
  ) {
    return this.prismaService.transactionTag.delete(args);
  }

  deleteMany<T extends Prisma.TransactionTagDeleteManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionTagDeleteManyArgs>,
  ) {
    return this.prismaService.transactionTag.deleteMany(args);
  }

  count<T extends Prisma.TransactionTagCountArgs>(
    args?: Prisma.SelectSubset<T, Prisma.TransactionTagCountArgs>,
  ) {
    return this.prismaService.transactionTag.count(args);
  }

  aggregate<T extends Prisma.TransactionTagAggregateArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionTagAggregateArgs>,
  ) {
    return this.prismaService.transactionTag.aggregate(args);
  }

  groupBy(args: Prisma.TransactionTagGroupByArgs) {
    return this.prismaService.transactionTag.groupBy({
      ...args,
      orderBy: args.orderBy,
    });
  }
  get prisma() {
    return this.prismaService;
  }
}
