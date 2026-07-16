import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create<T extends Prisma.CategoryCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.CategoryCreateArgs>,
  ) {
    return this.prismaService.category.create(args);
  }

  createMany<T extends Prisma.CategoryCreateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.CategoryCreateManyArgs>,
  ) {
    return this.prismaService.category.createMany(args);
  }

  findUnique<T extends Prisma.CategoryFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.CategoryFindUniqueArgs>,
  ) {
    return this.prismaService.category.findUnique(args);
  }

  findFirst<T extends Prisma.CategoryFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.CategoryFindFirstArgs>,
  ) {
    return this.prismaService.category.findFirst(args);
  }

  findMany<T extends Prisma.CategoryFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.CategoryFindManyArgs>,
  ) {
    return this.prismaService.category.findMany(args);
  }

  update<T extends Prisma.CategoryUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.CategoryUpdateArgs>,
  ) {
    return this.prismaService.category.update(args);
  }

  updateMany<T extends Prisma.CategoryUpdateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.CategoryUpdateManyArgs>,
  ) {
    return this.prismaService.category.updateMany(args);
  }

  delete<T extends Prisma.CategoryDeleteArgs>(
    args: Prisma.SelectSubset<T, Prisma.CategoryDeleteArgs>,
  ) {
    return this.prismaService.category.delete(args);
  }

  deleteMany<T extends Prisma.CategoryDeleteManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.CategoryDeleteManyArgs>,
  ) {
    return this.prismaService.category.deleteMany(args);
  }

  count<T extends Prisma.CategoryCountArgs>(
    args?: Prisma.SelectSubset<T, Prisma.CategoryCountArgs>,
  ) {
    return this.prismaService.category.count(args);
  }

  aggregate<T extends Prisma.CategoryAggregateArgs>(
    args: Prisma.SelectSubset<T, Prisma.CategoryAggregateArgs>,
  ) {
    return this.prismaService.category.aggregate(args);
  }

  groupBy(args: Prisma.CategoryGroupByArgs) {
    return this.prismaService.category.groupBy({
      ...args,
      orderBy: args.orderBy,
    });
  }
  get prisma() {
    return this.prismaService;
  }
}
