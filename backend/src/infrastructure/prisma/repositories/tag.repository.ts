import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TagRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create<T extends Prisma.TagCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.TagCreateArgs>,
  ) {
    return this.prismaService.tag.create(args);
  }

  createMany<T extends Prisma.TagCreateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.TagCreateManyArgs>,
  ) {
    return this.prismaService.tag.createMany(args);
  }

  findUnique<T extends Prisma.TagFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.TagFindUniqueArgs>,
  ) {
    return this.prismaService.tag.findUnique(args);
  }

  findFirst<T extends Prisma.TagFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.TagFindFirstArgs>,
  ) {
    return this.prismaService.tag.findFirst(args);
  }

  findMany<T extends Prisma.TagFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.TagFindManyArgs>,
  ) {
    return this.prismaService.tag.findMany(args);
  }

  update<T extends Prisma.TagUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.TagUpdateArgs>,
  ) {
    return this.prismaService.tag.update(args);
  }

  updateMany<T extends Prisma.TagUpdateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.TagUpdateManyArgs>,
  ) {
    return this.prismaService.tag.updateMany(args);
  }

  delete<T extends Prisma.TagDeleteArgs>(
    args: Prisma.SelectSubset<T, Prisma.TagDeleteArgs>,
  ) {
    return this.prismaService.tag.delete(args);
  }

  deleteMany<T extends Prisma.TagDeleteManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.TagDeleteManyArgs>,
  ) {
    return this.prismaService.tag.deleteMany(args);
  }

  count<T extends Prisma.TagCountArgs>(
    args?: Prisma.SelectSubset<T, Prisma.TagCountArgs>,
  ) {
    return this.prismaService.tag.count(args);
  }

  aggregate<T extends Prisma.TagAggregateArgs>(
    args: Prisma.SelectSubset<T, Prisma.TagAggregateArgs>,
  ) {
    return this.prismaService.tag.aggregate(args);
  }

  groupBy(args: Prisma.TagGroupByArgs) {
    return this.prismaService.tag.groupBy({
      ...args,
      orderBy: args.orderBy,
    });
  }
  get prisma() {
    return this.prismaService;
  }
}
