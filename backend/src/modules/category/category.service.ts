import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoryRepository } from 'src/infrastructure/prisma/repositories';
import { CreateCategoryDto } from './dto/CreateCategoryDto';
import { CATEGORY } from './category.constants';
import { UpdateCategoryDto } from './dto/UpdateCategoryDto';
import { PaginationDto } from './dto/PaginationDto';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(userId: string, dto: CreateCategoryDto) {
    // Kiểm tra số lượng category hiện tại của user
    const categoryCount = await this.categoryRepository.count({
      where: {
        userId,
        deletedAt: null,
        isSystem: false,
      },
    });

    if (categoryCount >= CATEGORY.MAX_CATEGORIES) {
      throw new BadRequestException(
        `Bạn chỉ được tạo tối đa ${CATEGORY.MAX_CATEGORIES} danh mục`,
      );
    }

    const nameVi = dto.nameVi || dto.name;
    if (!nameVi) {
      throw new BadRequestException('Tên danh mục tiếng Việt không được để trống');
    }
    const nameEn = dto.nameEn || nameVi;

    // Kiểm tra tên category đã tồn tại chưa
    const existed = await this.categoryRepository.findFirst({
      where: {
        userId,
        nameVi,
        type: dto.type,
        deletedAt: null,
      },
    });

    if (existed) {
      throw new BadRequestException('Tên danh mục đã tồn tại');
    }

    // Nếu có parentId, kiểm tra parent tồn tại và cùng type
    if (dto.parentId) {
      const parent = await this.categoryRepository.findFirst({
        where: {
          id: dto.parentId,
          userId,
          deletedAt: null,
        },
      });

      if (!parent) {
        throw new NotFoundException('Danh mục cha không tồn tại');
      }

      if (parent.type !== dto.type) {
        throw new BadRequestException(
          'Danh mục cha phải cùng loại (INCOME hoặc EXPENSE)',
        );
      }

      // Kiểm tra không được tạo category con quá sâu (max 2 cấp)
      if (parent.parentId) {
        throw new BadRequestException(
          'Không thể tạo danh mục con cho danh mục đã là con',
        );
      }
    }

    const { name: _legacyName, ...cleanDto } = dto;
    const category = await this.categoryRepository.create({
      data: {
        userId,
        ...cleanDto,
        nameVi,
        nameEn,
        isSystem: false,
      },
    });

    return {
      message: 'Tạo danh mục thành công',
      data: {
        ...category,
        name: category.nameVi,
      },
    };
  }

  async update(categoryId: string, userId: string, dto: UpdateCategoryDto) {
    // Kiểm tra category tồn tại và thuộc về user
    const category = await this.categoryRepository.findFirst({
      where: {
        id: categoryId,
        userId,
        deletedAt: null,
        isSystem: false, // Không cho phép sửa category hệ thống
      },
    });

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    const nameVi = dto.nameVi || dto.name;
    const nameEn = dto.nameEn;

    // Kiểm tra tên mới không trùng với category khác
    if (nameVi && nameVi !== category.nameVi) {
      const existed = await this.categoryRepository.findFirst({
        where: {
          userId,
          nameVi,
          type: category.type,
          deletedAt: null,
          NOT: {
            id: categoryId,
          },
        },
      });

      if (existed) {
        throw new BadRequestException('Tên danh mục đã tồn tại');
      }
    }

    // Nếu cập nhật parentId
    if (dto.parentId !== undefined) {
      if (dto.parentId) {
        // Kiểm tra không được set parent là chính nó
        if (dto.parentId === categoryId) {
          throw new BadRequestException(
            'Không thể đặt danh mục cha là chính nó',
          );
        }

        const parent = await this.categoryRepository.findFirst({
          where: {
            id: dto.parentId,
            userId,
            deletedAt: null,
          },
        });

        if (!parent) {
          throw new NotFoundException('Danh mục cha không tồn tại');
        }

        if (parent.type !== category.type) {
          throw new BadRequestException(
            'Danh mục cha phải cùng loại (INCOME hoặc EXPENSE)',
          );
        }

        // Kiểm tra không được tạo category con quá sâu
        if (parent.parentId) {
          throw new BadRequestException(
            'Không thể đặt danh mục cha cho danh mục đã là con',
          );
        }

        // Kiểm tra category này có đang là parent của category khác không
        const hasChildren = await this.categoryRepository.count({
          where: {
            parentId: categoryId,
            deletedAt: null,
          },
        });

        if (hasChildren > 0) {
          throw new BadRequestException(
            'Không thể đặt danh mục cha vì danh mục này đang có danh mục con',
          );
        }
      }
    }

    const { name: _legacyName, ...cleanDto } = dto;
    const updatedCategory = await this.categoryRepository.update({
      where: {
        id: categoryId,
      },
      data: {
        ...cleanDto,
        ...(nameVi ? { nameVi } : {}),
        ...(nameEn !== undefined
          ? { nameEn: nameEn || nameVi || category.nameVi }
          : {}),
      },
    });

    return {
      message: 'Cập nhật danh mục thành công',
      data: {
        ...updatedCategory,
        name: updatedCategory.nameVi,
      },
    };
  }

  async findAll(userId: string, query: PaginationDto) {
    const { page, limit, search, type, parentId, sortBy, order } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = {
      OR: [{ userId }, { userId: null, isSystem: true }],
      deletedAt: null,
      ...(search && {
        OR: [
          {
            nameVi: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            nameEn: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }),
      ...(type && {
        type,
      }),
      ...(parentId !== undefined && {
        parentId: parentId || null,
      }),
    };
    const orderBy = sortBy
      ? sortBy === 'name'
        ? { nameVi: order }
        : { [sortBy]: order }
      : { nameVi: 'asc' as const };

    const [categories, total] = await Promise.all([
      this.categoryRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.categoryRepository.count({
        where,
      }),
    ]);

    const mappedCategories = categories.map((cat) => ({
      ...cat,
      name: cat.nameVi,
    }));

    return {
      message: 'Lấy danh sách danh mục thành công',
      data: mappedCategories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(categoryId: string, userId: string) {
    const category = await this.categoryRepository.findFirst({
      where: {
        id: categoryId,
        userId,
        deletedAt: null,
      },
      include: {
        parent: {
          select: {
            id: true,
            nameVi: true,
            nameEn: true,
            icon: true,
            color: true,
          },
        },
        children: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            nameVi: true,
            nameEn: true,
            icon: true,
            color: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    return {
      message: 'Lấy thông tin danh mục thành công',
      data: {
        ...category,
        name: category.nameVi,
      },
    };
  }

  async remove(categoryId: string, userId: string) {
    // Kiểm tra category tồn tại
    const category = await this.categoryRepository.findFirst({
      where: {
        id: categoryId,
        userId,
        deletedAt: null,
        isSystem: false,
      },
    });

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    // Đếm số lượng children
    const childrenCount = await this.categoryRepository.count({
      where: {
        parentId: categoryId,
        deletedAt: null,
      },
    });

    if (childrenCount > 0) {
      throw new BadRequestException(
        'Không thể xóa danh mục vì còn danh mục con',
      );
    }

    await this.categoryRepository.update({
      where: {
        id: categoryId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      message: 'Xóa danh mục thành công',
    };
  }
}
