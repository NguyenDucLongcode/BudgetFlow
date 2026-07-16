import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BudgetRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create<T extends Prisma.BudgetCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.BudgetCreateArgs>,
  ) {
    return this.prismaService.budget.create(args);
  }

  createMany<T extends Prisma.BudgetCreateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.BudgetCreateManyArgs>,
  ) {
    return this.prismaService.budget.createMany(args);
  }

  findUnique<T extends Prisma.BudgetFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.BudgetFindUniqueArgs>,
  ) {
    return this.prismaService.budget.findUnique(args);
  }

  findFirst<T extends Prisma.BudgetFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.BudgetFindFirstArgs>,
  ) {
    return this.prismaService.budget.findFirst(args);
  }

  findMany<T extends Prisma.BudgetFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.BudgetFindManyArgs>,
  ) {
    return this.prismaService.budget.findMany(args);
  }

  update<T extends Prisma.BudgetUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.BudgetUpdateArgs>,
  ) {
    return this.prismaService.budget.update(args);
  }

  updateMany<T extends Prisma.BudgetUpdateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.BudgetUpdateManyArgs>,
  ) {
    return this.prismaService.budget.updateMany(args);
  }

  delete<T extends Prisma.BudgetDeleteArgs>(
    args: Prisma.SelectSubset<T, Prisma.BudgetDeleteArgs>,
  ) {
    return this.prismaService.budget.delete(args);
  }

  deleteMany<T extends Prisma.BudgetDeleteManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.BudgetDeleteManyArgs>,
  ) {
    return this.prismaService.budget.deleteMany(args);
  }

  count<T extends Prisma.BudgetCountArgs>(
    args?: Prisma.SelectSubset<T, Prisma.BudgetCountArgs>,
  ) {
    return this.prismaService.budget.count(args);
  }

  aggregate<T extends Prisma.BudgetAggregateArgs>(
    args: Prisma.SelectSubset<T, Prisma.BudgetAggregateArgs>,
  ) {
    return this.prismaService.budget.aggregate(args);
  }

  groupBy(args: Prisma.BudgetGroupByArgs) {
    return this.prismaService.budget.groupBy({
      ...args,
      orderBy: args.orderBy,
    });
  }

  get prisma() {
    return this.prismaService;
  }
}
