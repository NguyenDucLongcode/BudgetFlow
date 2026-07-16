import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RecurringTransactionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create<T extends Prisma.RecurringTransactionCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.RecurringTransactionCreateArgs>,
  ) {
    return this.prismaService.recurringTransaction.create(args);
  }

  createMany<T extends Prisma.RecurringTransactionCreateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.RecurringTransactionCreateManyArgs>,
  ) {
    return this.prismaService.recurringTransaction.createMany(args);
  }

  findUnique<T extends Prisma.RecurringTransactionFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.RecurringTransactionFindUniqueArgs>,
  ) {
    return this.prismaService.recurringTransaction.findUnique(args);
  }

  findFirst<T extends Prisma.RecurringTransactionFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.RecurringTransactionFindFirstArgs>,
  ) {
    return this.prismaService.recurringTransaction.findFirst(args);
  }

  findMany<T extends Prisma.RecurringTransactionFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.RecurringTransactionFindManyArgs>,
  ) {
    return this.prismaService.recurringTransaction.findMany(args);
  }

  update<T extends Prisma.RecurringTransactionUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.RecurringTransactionUpdateArgs>,
  ) {
    return this.prismaService.recurringTransaction.update(args);
  }

  updateMany<T extends Prisma.RecurringTransactionUpdateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.RecurringTransactionUpdateManyArgs>,
  ) {
    return this.prismaService.recurringTransaction.updateMany(args);
  }

  delete<T extends Prisma.RecurringTransactionDeleteArgs>(
    args: Prisma.SelectSubset<T, Prisma.RecurringTransactionDeleteArgs>,
  ) {
    return this.prismaService.recurringTransaction.delete(args);
  }

  deleteMany<T extends Prisma.RecurringTransactionDeleteManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.RecurringTransactionDeleteManyArgs>,
  ) {
    return this.prismaService.recurringTransaction.deleteMany(args);
  }

  count<T extends Prisma.RecurringTransactionCountArgs>(
    args?: Prisma.SelectSubset<T, Prisma.RecurringTransactionCountArgs>,
  ) {
    return this.prismaService.recurringTransaction.count(args);
  }

  aggregate<T extends Prisma.RecurringTransactionAggregateArgs>(
    args: Prisma.SelectSubset<T, Prisma.RecurringTransactionAggregateArgs>,
  ) {
    return this.prismaService.recurringTransaction.aggregate(args);
  }

  groupBy(args: Prisma.RecurringTransactionGroupByArgs) {
    return this.prismaService.recurringTransaction.groupBy({
      ...args,
      orderBy: args.orderBy,
    });
  }

  get prisma() {
    return this.prismaService;
  }
}
