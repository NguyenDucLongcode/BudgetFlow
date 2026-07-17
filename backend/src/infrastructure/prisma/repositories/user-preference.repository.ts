import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from 'generated/prisma/browser';

@Injectable()
export class UserPreferenceRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create<T extends Prisma.UserPreferenceCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserPreferenceCreateArgs>,
  ) {
    return this.prismaService.userPreference.create(args);
  }

  createMany<T extends Prisma.UserPreferenceCreateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserPreferenceCreateManyArgs>,
  ) {
    return this.prismaService.userPreference.createMany(args);
  }

  findUnique<T extends Prisma.UserPreferenceFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserPreferenceFindUniqueArgs>,
  ) {
    return this.prismaService.userPreference.findUnique(args);
  }

  findFirst<T extends Prisma.UserPreferenceFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserPreferenceFindFirstArgs>,
  ) {
    return this.prismaService.userPreference.findFirst(args);
  }

  findMany<T extends Prisma.UserPreferenceFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserPreferenceFindManyArgs>,
  ) {
    return this.prismaService.userPreference.findMany(args);
  }

  update<T extends Prisma.UserPreferenceUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserPreferenceUpdateArgs>,
  ) {
    return this.prismaService.userPreference.update(args);
  }

  updateMany<T extends Prisma.UserPreferenceUpdateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserPreferenceUpdateManyArgs>,
  ) {
    return this.prismaService.userPreference.updateMany(args);
  }

  delete<T extends Prisma.UserPreferenceDeleteArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserPreferenceDeleteArgs>,
  ) {
    return this.prismaService.userPreference.delete(args);
  }

  deleteMany<T extends Prisma.UserPreferenceDeleteManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserPreferenceDeleteManyArgs>,
  ) {
    return this.prismaService.userPreference.deleteMany(args);
  }

  count<T extends Prisma.UserPreferenceCountArgs>(
    args?: Prisma.SelectSubset<T, Prisma.UserPreferenceCountArgs>,
  ) {
    return this.prismaService.userPreference.count(args);
  }

  aggregate<T extends Prisma.UserPreferenceAggregateArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserPreferenceAggregateArgs>,
  ) {
    return this.prismaService.userPreference.aggregate(args);
  }

  groupBy(args: Prisma.UserPreferenceGroupByArgs) {
    return this.prismaService.userPreference.groupBy({
      ...args,
      orderBy: args.orderBy,
    });
  }

  get prisma() {
    return this.prismaService;
  }
}
