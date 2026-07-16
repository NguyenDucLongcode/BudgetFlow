import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DebtPaymentRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(args: Prisma.DebtPaymentCreateArgs) {
    return this.prismaService.debtPayment.create(args);
  }

  createMany(args: Prisma.DebtPaymentCreateManyArgs) {
    return this.prismaService.debtPayment.createMany(args);
  }

  findUnique(args: Prisma.DebtPaymentFindUniqueArgs) {
    return this.prismaService.debtPayment.findUnique(args);
  }
  findFirst<T extends Prisma.DebtPaymentFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.DebtPaymentFindFirstArgs>,
  ) {
    return this.prismaService.debtPayment.findFirst(args);
  }

  findMany(args: Prisma.DebtPaymentFindManyArgs) {
    return this.prismaService.debtPayment.findMany(args);
  }

  update(args: Prisma.DebtPaymentUpdateArgs) {
    return this.prismaService.debtPayment.update(args);
  }

  updateMany(args: Prisma.DebtPaymentUpdateManyArgs) {
    return this.prismaService.debtPayment.updateMany(args);
  }

  delete(args: Prisma.DebtPaymentDeleteArgs) {
    return this.prismaService.debtPayment.delete(args);
  }

  deleteMany(args: Prisma.DebtPaymentDeleteManyArgs) {
    return this.prismaService.debtPayment.deleteMany(args);
  }

  count(args?: Prisma.DebtPaymentCountArgs) {
    return this.prismaService.debtPayment.count(args);
  }

  groupBy(args: Prisma.DebtPaymentGroupByArgs) {
    return this.prismaService.debtPayment.groupBy({
      ...args,
      orderBy: args.orderBy,
    });
  }

  get prisma() {
    return this.prismaService;
  }
}
