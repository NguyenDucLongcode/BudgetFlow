import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from 'generated/prisma/browser';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create<T extends Prisma.NotificationCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.NotificationCreateArgs>,
  ) {
    return this.prismaService.notification.create(args);
  }

  createMany<T extends Prisma.NotificationCreateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.NotificationCreateManyArgs>,
  ) {
    return this.prismaService.notification.createMany(args);
  }

  findUnique<T extends Prisma.NotificationFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.NotificationFindUniqueArgs>,
  ) {
    return this.prismaService.notification.findUnique(args);
  }

  findFirst<T extends Prisma.NotificationFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.NotificationFindFirstArgs>,
  ) {
    return this.prismaService.notification.findFirst(args);
  }

  findMany<T extends Prisma.NotificationFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.NotificationFindManyArgs>,
  ) {
    return this.prismaService.notification.findMany(args);
  }

  update<T extends Prisma.NotificationUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.NotificationUpdateArgs>,
  ) {
    return this.prismaService.notification.update(args);
  }

  updateMany<T extends Prisma.NotificationUpdateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.NotificationUpdateManyArgs>,
  ) {
    return this.prismaService.notification.updateMany(args);
  }

  delete<T extends Prisma.NotificationDeleteArgs>(
    args: Prisma.SelectSubset<T, Prisma.NotificationDeleteArgs>,
  ) {
    return this.prismaService.notification.delete(args);
  }

  deleteMany<T extends Prisma.NotificationDeleteManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.NotificationDeleteManyArgs>,
  ) {
    return this.prismaService.notification.deleteMany(args);
  }

  count<T extends Prisma.NotificationCountArgs>(
    args?: Prisma.SelectSubset<T, Prisma.NotificationCountArgs>,
  ) {
    return this.prismaService.notification.count(args);
  }

  aggregate<T extends Prisma.NotificationAggregateArgs>(
    args: Prisma.SelectSubset<T, Prisma.NotificationAggregateArgs>,
  ) {
    return this.prismaService.notification.aggregate(args);
  }

  groupBy(args: Prisma.NotificationGroupByArgs) {
    return this.prismaService.notification.groupBy({
      ...args,
      orderBy: args.orderBy,
    });
  }

  get prisma() {
    return this.prismaService;
  }
}
