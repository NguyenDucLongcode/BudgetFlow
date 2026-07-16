import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  create<T extends Prisma.UserCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserCreateArgs>,
  ) {
    return this.prisma.user.create(args);
  }

  findUnique<T extends Prisma.UserFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserFindUniqueArgs>,
  ) {
    return this.prisma.user.findUnique(args);
  }

  findUniqueOrThrow<T extends Prisma.UserFindUniqueOrThrowArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserFindUniqueOrThrowArgs>,
  ) {
    return this.prisma.user.findUniqueOrThrow(args);
  }

  findFirst<T extends Prisma.UserFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserFindFirstArgs>,
  ) {
    return this.prisma.user.findFirst(args);
  }

  findMany<T extends Prisma.UserFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserFindManyArgs>,
  ) {
    return this.prisma.user.findMany(args);
  }

  update<T extends Prisma.UserUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserUpdateArgs>,
  ) {
    return this.prisma.user.update(args);
  }

  updateMany<T extends Prisma.UserUpdateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserUpdateManyArgs>,
  ) {
    return this.prisma.user.updateMany(args);
  }

  delete<T extends Prisma.UserDeleteArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserDeleteArgs>,
  ) {
    return this.prisma.user.delete(args);
  }

  deleteMany<T extends Prisma.UserDeleteManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserDeleteManyArgs>,
  ) {
    return this.prisma.user.deleteMany(args);
  }

  count<T extends Prisma.UserCountArgs>(
    args?: Prisma.SelectSubset<T, Prisma.UserCountArgs>,
  ) {
    return this.prisma.user.count(args);
  }

  aggregate<T extends Prisma.UserAggregateArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserAggregateArgs>,
  ) {
    return this.prisma.user.aggregate(args);
  }

  groupBy(args: Prisma.UserGroupByArgs) {
    return this.prismaService.user.groupBy({
      ...args,
      orderBy: args.orderBy,
    });
  }

  get prismaService() {
    return this.prisma;
  }
}
