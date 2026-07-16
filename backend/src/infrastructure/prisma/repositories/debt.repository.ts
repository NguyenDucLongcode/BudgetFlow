import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DebtRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create<T extends Prisma.DebtCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.DebtCreateArgs>,
  ) {
    return this.prismaService.debt.create(args);
  }

  createMany<T extends Prisma.DebtCreateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.DebtCreateManyArgs>,
  ) {
    return this.prismaService.debt.createMany(args);
  }

  findUnique<T extends Prisma.DebtFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.DebtFindUniqueArgs>,
  ) {
    return this.prismaService.debt.findUnique(args);
  }

  findFirst<T extends Prisma.DebtFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.DebtFindFirstArgs>,
  ) {
    return this.prismaService.debt.findFirst(args);
  }

  findMany<T extends Prisma.DebtFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.DebtFindManyArgs>,
  ) {
    return this.prismaService.debt.findMany(args);
  }

  update<T extends Prisma.DebtUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.DebtUpdateArgs>,
  ) {
    return this.prismaService.debt.update(args);
  }

  updateMany<T extends Prisma.DebtUpdateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.DebtUpdateManyArgs>,
  ) {
    return this.prismaService.debt.updateMany(args);
  }

  delete<T extends Prisma.DebtDeleteArgs>(
    args: Prisma.SelectSubset<T, Prisma.DebtDeleteArgs>,
  ) {
    return this.prismaService.debt.delete(args);
  }

  deleteMany<T extends Prisma.DebtDeleteManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.DebtDeleteManyArgs>,
  ) {
    return this.prismaService.debt.deleteMany(args);
  }

  count<T extends Prisma.DebtCountArgs>(
    args?: Prisma.SelectSubset<T, Prisma.DebtCountArgs>,
  ) {
    return this.prismaService.debt.count(args);
  }

  aggregate<T extends Prisma.DebtAggregateArgs>(
    args: Prisma.SelectSubset<T, Prisma.DebtAggregateArgs>,
  ) {
    return this.prismaService.debt.aggregate(args);
  }

  groupBy(args: Prisma.DebtGroupByArgs) {
    return this.prismaService.debt.groupBy({
      ...args,
      orderBy: args.orderBy,
    });
  }
  get prisma() {
    return this.prismaService;
  }
}
