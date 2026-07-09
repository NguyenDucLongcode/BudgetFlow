import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUnique(args: Prisma.UserFindUniqueArgs) {
    return this.prisma.user.findUnique(args);
  }

  findUniqueOrThrow(args: Prisma.UserFindUniqueOrThrowArgs) {
    return this.prisma.user.findUniqueOrThrow(args);
  }

  findFirst(args: Prisma.UserFindFirstArgs) {
    return this.prisma.user.findFirst(args);
  }

  findMany(args: Prisma.UserFindManyArgs) {
    return this.prisma.user.findMany(args);
  }

  create(args: Prisma.UserCreateArgs) {
    return this.prisma.user.create(args);
  }

  update(args: Prisma.UserUpdateArgs) {
    return this.prisma.user.update(args);
  }

  // Soft delete
  updateMany(args: Prisma.UserUpdateManyArgs) {
    return this.prisma.user.updateMany(args);
  }

  delete(args: Prisma.UserDeleteArgs) {
    return this.prisma.user.delete(args);
  }

  deleteMany(args: Prisma.UserDeleteManyArgs) {
    return this.prisma.user.deleteMany(args);
  }

  count(args?: Prisma.UserCountArgs) {
    return this.prisma.user.count(args);
  }

  // =========================
  // Convenience methods
  // =========================

  findById(id: string) {
    return this.findUnique({
      where: { id },
    });
  }

  findByEmail(email: string) {
    return this.findUnique({
      where: { email },
    });
  }
}
