import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { TagRepository } from 'src/infrastructure/prisma/repositories';
import { CreateTagDto } from './dto/CreateTagDto';
import { UpdateTagDto } from './dto/UpdateTagDto';
import { TagQueryDto } from './dto/TagQueryDto';
import { TAG } from './tag.constants';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class TagService {
  constructor(private readonly tagRepository: TagRepository) {}

  async create(userId: string, dto: CreateTagDto) {
    // Kiểm tra số lượng tag của user
    const count = await this.tagRepository.count({
      where: {
        userId,
      },
    });

    if (count >= TAG.MAX_TAGS_PER_USER) {
      throw new BadRequestException(
        `Bạn chỉ được tạo tối đa ${TAG.MAX_TAGS_PER_USER} tag`,
      );
    }

    // Kiểm tra tên tag đã tồn tại
    const existing = await this.tagRepository.findFirst({
      where: {
        userId,
        name: dto.name,
      },
    });

    if (existing) {
      throw new ConflictException(`Tag "${dto.name}" đã tồn tại`);
    }

    const tag = await this.tagRepository.create({
      data: {
        userId,
        name: dto.name,
        color: dto.color || TAG.DEFAULT_COLOR,
        icon: dto.icon,
      },
    });

    return {
      message: 'Tạo tag thành công',
      data: tag,
    };
  }

  async findAll(userId: string, query: TagQueryDto) {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'name',
      order = 'asc',
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.TagWhereInput = {
      userId,
      ...(search && {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      }),
    };

    const orderBy = { [sortBy]: order } as any;

    const [tags, total] = await Promise.all([
      this.tagRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          transactionTags: {
            select: {
              transactionId: true,
            },
          },
        },
      }),
      this.tagRepository.count({ where }),
    ]);

    // Format response với số lượng giao dịch
    const data = tags.map((tag) => ({
      ...tag,
      transactionCount: tag.transactionTags.length,
      transactionTags: undefined, // Ẩn đi để response gọn
    }));

    return {
      message: 'Lấy danh sách tag thành công',
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async findOne(tagId: string, userId: string) {
    const tag = await this.tagRepository.findFirst({
      where: {
        id: tagId,
        userId,
      },
      include: {
        transactionTags: {
          include: {
            transaction: {
              select: {
                id: true,
                description: true,
                amount: true,
                type: true,
                date: true,
              },
            },
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException('Không tìm thấy tag');
    }

    return {
      message: 'Lấy thông tin tag thành công',
      data: {
        ...tag,
        transactionCount: tag.transactionTags.length,
      },
    };
  }

  async update(tagId: string, userId: string, dto: UpdateTagDto) {
    // Kiểm tra tag tồn tại
    const existing = await this.tagRepository.findFirst({
      where: {
        id: tagId,
        userId,
      },
    });

    if (!existing) {
      throw new NotFoundException('Không tìm thấy tag');
    }

    // Kiểm tra tên mới không trùng với tag khác
    if (dto.name && dto.name !== existing.name) {
      const duplicate = await this.tagRepository.findFirst({
        where: {
          userId,
          name: dto.name,
          NOT: {
            id: tagId,
          },
        },
      });

      if (duplicate) {
        throw new ConflictException(`Tag "${dto.name}" đã tồn tại`);
      }
    }

    const updated = await this.tagRepository.update({
      where: { id: tagId },
      data: dto,
    });

    return {
      message: 'Cập nhật tag thành công',
      data: updated,
    };
  }

  async remove(tagId: string, userId: string) {
    const tag = await this.tagRepository.findFirst({
      where: {
        id: tagId,
        userId,
      },
    });

    if (!tag) {
      throw new NotFoundException('Không tìm thấy tag');
    }

    await this.tagRepository.delete({
      where: { id: tagId },
    });

    return {
      message: 'Xóa tag thành công',
    };
  }

  // =========================
  // BULK OPERATIONS
  // =========================

  async createBulk(userId: string, names: string[]) {
    if (names.length === 0) {
      throw new BadRequestException('Danh sách tag không được trống');
    }

    // Kiểm tra số lượng
    const count = await this.tagRepository.count({
      where: { userId },
    });

    if (count + names.length > TAG.MAX_TAGS_PER_USER) {
      throw new BadRequestException(
        `Vượt quá giới hạn ${TAG.MAX_TAGS_PER_USER} tag`,
      );
    }

    // Lọc tên trùng
    const existingTags = await this.tagRepository.findMany({
      where: {
        userId,
        name: {
          in: names,
        },
      },
      select: { name: true },
    });

    const existingNames = new Set(existingTags.map((t) => t.name));
    const newNames = names.filter((name) => !existingNames.has(name));

    if (newNames.length === 0) {
      throw new ConflictException('Tất cả tag đều đã tồn tại');
    }

    const result = await this.tagRepository.createMany({
      data: newNames.map((name) => ({
        userId,
        name,
        color: TAG.DEFAULT_COLOR,
      })),
      skipDuplicates: true,
    });

    return {
      message: `Tạo ${result.count} tag thành công`,
      data: {
        created: result.count,
        skipped: names.length - result.count,
        existing: existingNames.size,
      },
    };
  }

  // =========================
  // SEARCH & AUTOCOMPLETE
  // =========================

  async autocomplete(userId: string, query: string) {
    if (!query || query.length < 1) {
      return this.findAll(userId, { page: 1, limit: 10 });
    }

    const tags = await this.tagRepository.findMany({
      where: {
        userId,
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: 10,
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        color: true,
        icon: true,
      },
    });

    return {
      message: 'Kết quả tìm kiếm tag',
      data: tags,
    };
  }

  // =========================
  // GET POPULAR TAGS
  // =========================

  async getPopularTags(userId: string, limit: number = 10) {
    const tags = await this.tagRepository.findMany({
      where: { userId },
      include: {
        transactionTags: true,
      },
      orderBy: {
        transactionTags: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return {
      message: 'Tag phổ biến nhất',
      data: tags.map((tag) => ({
        ...tag,
        usageCount: tag.transactionTags.length,
      })),
    };
  }
}
