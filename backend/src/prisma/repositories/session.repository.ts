import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUnique(args: Prisma.UserSessionFindUniqueArgs) {
    return this.prisma.userSession.findUnique(args);
  }

  findMany(args: Prisma.UserSessionFindManyArgs) {
    return this.prisma.userSession.findMany(args);
  }

  delete(args: Prisma.UserSessionDeleteArgs) {
    return this.prisma.userSession.delete(args);
  }

  deleteMany(args: Prisma.UserSessionDeleteManyArgs) {
    return this.prisma.userSession.deleteMany(args);
  }

  update(args: Prisma.UserSessionUpdateArgs) {
    return this.prisma.userSession.update(args);
  }

  count(args?: Prisma.UserSessionCountArgs) {
    return this.prisma.userSession.count(args);
  }

  upsert(args: Prisma.UserSessionUpsertArgs) {
    return this.prisma.userSession.upsert(args);
  }
}
