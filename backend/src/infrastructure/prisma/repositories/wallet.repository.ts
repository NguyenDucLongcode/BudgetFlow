import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class WalletRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create<T extends Prisma.WalletCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.WalletCreateArgs>,
  ) {
    return this.prismaService.wallet.create(args);
  }

  findById<T extends Prisma.WalletFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.WalletFindUniqueArgs>,
  ) {
    return this.prismaService.wallet.findUnique(args);
  }

  findFirst<T extends Prisma.WalletFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.WalletFindFirstArgs>,
  ) {
    return this.prismaService.wallet.findFirst(args);
  }

  findMany<T extends Prisma.WalletFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.WalletFindManyArgs>,
  ) {
    return this.prismaService.wallet.findMany(args);
  }

  update<T extends Prisma.WalletUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.WalletUpdateArgs>,
  ) {
    return this.prismaService.wallet.update(args);
  }

  updateMany<T extends Prisma.WalletUpdateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.WalletUpdateManyArgs>,
  ) {
    return this.prismaService.wallet.updateMany(args);
  }

  delete<T extends Prisma.WalletDeleteArgs>(
    args: Prisma.SelectSubset<T, Prisma.WalletDeleteArgs>,
  ) {
    return this.prismaService.wallet.delete(args);
  }

  deleteMany<T extends Prisma.WalletDeleteManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.WalletDeleteManyArgs>,
  ) {
    return this.prismaService.wallet.deleteMany(args);
  }

  count<T extends Prisma.WalletCountArgs>(
    args?: Prisma.SelectSubset<T, Prisma.WalletCountArgs>,
  ) {
    return this.prismaService.wallet.count(args);
  }

  aggregate<T extends Prisma.WalletAggregateArgs>(
    args: Prisma.SelectSubset<T, Prisma.WalletAggregateArgs>,
  ) {
    return this.prismaService.wallet.aggregate(args);
  }

  groupBy(args: Prisma.WalletGroupByArgs) {
    return this.prismaService.wallet.groupBy({
      ...args,
      orderBy: args.orderBy,
    });
  }
  get prisma() {
    return this.prismaService;
  }
}
