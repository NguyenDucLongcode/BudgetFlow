import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUnique<T extends Prisma.UserSessionFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserSessionFindUniqueArgs>,
  ) {
    return this.prisma.userSession.findUnique(args);
  }

  findMany<T extends Prisma.UserSessionFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserSessionFindManyArgs>,
  ) {
    return this.prisma.userSession.findMany(args);
  }

  update<T extends Prisma.UserSessionUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserSessionUpdateArgs>,
  ) {
    return this.prisma.userSession.update(args);
  }

  delete<T extends Prisma.UserSessionDeleteArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserSessionDeleteArgs>,
  ) {
    return this.prisma.userSession.delete(args);
  }

  deleteMany<T extends Prisma.UserSessionDeleteManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserSessionDeleteManyArgs>,
  ) {
    return this.prisma.userSession.deleteMany(args);
  }

  count<T extends Prisma.UserSessionCountArgs>(
    args?: Prisma.SelectSubset<T, Prisma.UserSessionCountArgs>,
  ) {
    return this.prisma.userSession.count(args);
  }

  upsert<T extends Prisma.UserSessionUpsertArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserSessionUpsertArgs>,
  ) {
    return this.prisma.userSession.upsert(args);
  }

  aggregate<T extends Prisma.UserSessionAggregateArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserSessionAggregateArgs>,
  ) {
    return this.prisma.userSession.aggregate(args);
  }

  groupBy(args: Prisma.UserSessionGroupByArgs) {
    return this.prismaService.userSession.groupBy({
      ...args,
      orderBy: args.orderBy,
    });
  }

  get prismaService() {
    return this.prisma;
  }
}
