import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TransactionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create<T extends Prisma.TransactionCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionCreateArgs>,
  ) {
    return this.prismaService.transaction.create(args);
  }

  createMany<T extends Prisma.TransactionCreateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionCreateManyArgs>,
  ) {
    return this.prismaService.transaction.createMany(args);
  }

  findUnique<T extends Prisma.TransactionFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionFindUniqueArgs>,
  ) {
    return this.prismaService.transaction.findUnique(args);
  }

  findFirst<T extends Prisma.TransactionFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionFindFirstArgs>,
  ) {
    return this.prismaService.transaction.findFirst(args);
  }

  findMany<T extends Prisma.TransactionFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionFindManyArgs>,
  ) {
    return this.prismaService.transaction.findMany(args);
  }

  update<T extends Prisma.TransactionUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionUpdateArgs>,
  ) {
    return this.prismaService.transaction.update(args);
  }

  updateMany<T extends Prisma.TransactionUpdateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionUpdateManyArgs>,
  ) {
    return this.prismaService.transaction.updateMany(args);
  }

  delete<T extends Prisma.TransactionDeleteArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionDeleteArgs>,
  ) {
    return this.prismaService.transaction.delete(args);
  }

  deleteMany<T extends Prisma.TransactionDeleteManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionDeleteManyArgs>,
  ) {
    return this.prismaService.transaction.deleteMany(args);
  }

  count<T extends Prisma.TransactionCountArgs>(
    args?: Prisma.SelectSubset<T, Prisma.TransactionCountArgs>,
  ) {
    return this.prismaService.transaction.count(args);
  }

  aggregate<T extends Prisma.TransactionAggregateArgs>(
    args: Prisma.SelectSubset<T, Prisma.TransactionAggregateArgs>,
  ) {
    return this.prismaService.transaction.aggregate(args);
  }

  groupBy(args: Prisma.TransactionGroupByArgs) {
    return this.prismaService.transaction.groupBy({
      ...args,
      orderBy: args.orderBy,
    });
  }

  get prisma() {
    return this.prismaService;
  }
}
