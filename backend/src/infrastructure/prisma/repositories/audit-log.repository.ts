import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuditLogRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create<T extends Prisma.AuditLogCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.AuditLogCreateArgs>,
  ) {
    return this.prismaService.auditLog.create(args);
  }

  createMany<T extends Prisma.AuditLogCreateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.AuditLogCreateManyArgs>,
  ) {
    return this.prismaService.auditLog.createMany(args);
  }

  findUnique<T extends Prisma.AuditLogFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.AuditLogFindUniqueArgs>,
  ) {
    return this.prismaService.auditLog.findUnique(args);
  }

  findFirst<T extends Prisma.AuditLogFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.AuditLogFindFirstArgs>,
  ) {
    return this.prismaService.auditLog.findFirst(args);
  }

  findMany<T extends Prisma.AuditLogFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.AuditLogFindManyArgs>,
  ) {
    return this.prismaService.auditLog.findMany(args);
  }

  update<T extends Prisma.AuditLogUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.AuditLogUpdateArgs>,
  ) {
    return this.prismaService.auditLog.update(args);
  }

  updateMany<T extends Prisma.AuditLogUpdateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.AuditLogUpdateManyArgs>,
  ) {
    return this.prismaService.auditLog.updateMany(args);
  }

  delete<T extends Prisma.AuditLogDeleteArgs>(
    args: Prisma.SelectSubset<T, Prisma.AuditLogDeleteArgs>,
  ) {
    return this.prismaService.auditLog.delete(args);
  }

  deleteMany<T extends Prisma.AuditLogDeleteManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.AuditLogDeleteManyArgs>,
  ) {
    return this.prismaService.auditLog.deleteMany(args);
  }

  count<T extends Prisma.AuditLogCountArgs>(
    args?: Prisma.SelectSubset<T, Prisma.AuditLogCountArgs>,
  ) {
    return this.prismaService.auditLog.count(args);
  }

  aggregate<T extends Prisma.AuditLogAggregateArgs>(
    args: Prisma.SelectSubset<T, Prisma.AuditLogAggregateArgs>,
  ) {
    return this.prismaService.auditLog.aggregate(args);
  }

  groupBy(args: Prisma.AuditLogGroupByArgs) {
    return this.prismaService.auditLog.groupBy({
      ...args,
      orderBy: args.orderBy,
    });
  }

  get prisma() {
    return this.prismaService;
  }
}
