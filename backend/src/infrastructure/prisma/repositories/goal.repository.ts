import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GoalRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create<T extends Prisma.GoalCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.GoalCreateArgs>,
  ) {
    return this.prismaService.goal.create(args);
  }

  createMany<T extends Prisma.GoalCreateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.GoalCreateManyArgs>,
  ) {
    return this.prismaService.goal.createMany(args);
  }

  findUnique<T extends Prisma.GoalFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.GoalFindUniqueArgs>,
  ) {
    return this.prismaService.goal.findUnique(args);
  }

  findFirst<T extends Prisma.GoalFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.GoalFindFirstArgs>,
  ) {
    return this.prismaService.goal.findFirst(args);
  }

  findMany<T extends Prisma.GoalFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.GoalFindManyArgs>,
  ) {
    return this.prismaService.goal.findMany(args);
  }

  update<T extends Prisma.GoalUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.GoalUpdateArgs>,
  ) {
    return this.prismaService.goal.update(args);
  }

  updateMany<T extends Prisma.GoalUpdateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.GoalUpdateManyArgs>,
  ) {
    return this.prismaService.goal.updateMany(args);
  }

  delete<T extends Prisma.GoalDeleteArgs>(
    args: Prisma.SelectSubset<T, Prisma.GoalDeleteArgs>,
  ) {
    return this.prismaService.goal.delete(args);
  }

  deleteMany<T extends Prisma.GoalDeleteManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.GoalDeleteManyArgs>,
  ) {
    return this.prismaService.goal.deleteMany(args);
  }

  count<T extends Prisma.GoalCountArgs>(
    args?: Prisma.SelectSubset<T, Prisma.GoalCountArgs>,
  ) {
    return this.prismaService.goal.count(args);
  }

  aggregate<T extends Prisma.GoalAggregateArgs>(
    args: Prisma.SelectSubset<T, Prisma.GoalAggregateArgs>,
  ) {
    return this.prismaService.goal.aggregate(args);
  }

  groupBy(args: Prisma.GoalGroupByArgs) {
    return this.prismaService.goal.groupBy({
      ...args,
      orderBy: args.orderBy,
    });
  }

  get prisma() {
    return this.prismaService;
  }
}
