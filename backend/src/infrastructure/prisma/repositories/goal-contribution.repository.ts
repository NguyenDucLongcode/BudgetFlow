import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GoalContributionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create<T extends Prisma.GoalContributionCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.GoalContributionCreateArgs>,
  ) {
    return this.prismaService.goalContribution.create(args);
  }

  createMany<T extends Prisma.GoalContributionCreateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.GoalContributionCreateManyArgs>,
  ) {
    return this.prismaService.goalContribution.createMany(args);
  }

  findUnique<T extends Prisma.GoalContributionFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.GoalContributionFindUniqueArgs>,
  ) {
    return this.prismaService.goalContribution.findUnique(args);
  }

  findFirst<T extends Prisma.GoalContributionFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.GoalContributionFindFirstArgs>,
  ) {
    return this.prismaService.goalContribution.findFirst(args);
  }

  findMany<T extends Prisma.GoalContributionFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.GoalContributionFindManyArgs>,
  ) {
    return this.prismaService.goalContribution.findMany(args);
  }

  update<T extends Prisma.GoalContributionUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.GoalContributionUpdateArgs>,
  ) {
    return this.prismaService.goalContribution.update(args);
  }

  updateMany<T extends Prisma.GoalContributionUpdateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.GoalContributionUpdateManyArgs>,
  ) {
    return this.prismaService.goalContribution.updateMany(args);
  }

  delete<T extends Prisma.GoalContributionDeleteArgs>(
    args: Prisma.SelectSubset<T, Prisma.GoalContributionDeleteArgs>,
  ) {
    return this.prismaService.goalContribution.delete(args);
  }

  deleteMany<T extends Prisma.GoalContributionDeleteManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.GoalContributionDeleteManyArgs>,
  ) {
    return this.prismaService.goalContribution.deleteMany(args);
  }

  count<T extends Prisma.GoalContributionCountArgs>(
    args?: Prisma.SelectSubset<T, Prisma.GoalContributionCountArgs>,
  ) {
    return this.prismaService.goalContribution.count(args);
  }

  aggregate<T extends Prisma.GoalContributionAggregateArgs>(
    args: Prisma.SelectSubset<T, Prisma.GoalContributionAggregateArgs>,
  ) {
    return this.prismaService.goalContribution.aggregate(args);
  }

  groupBy(args: Prisma.GoalContributionGroupByArgs) {
    return this.prismaService.goalContribution.groupBy({
      ...args,
      orderBy: args.orderBy,
    });
  }
  get prisma() {
    return this.prismaService;
  }
}
