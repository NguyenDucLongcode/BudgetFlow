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
import { Prisma, CategoryType } from 'generated/prisma/client';

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

    // Kiểm tra tên category đã tồn tại chưa
    const existed = await this.categoryRepository.findFirst({
      where: {
        userId,
        name: dto.name,
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

    const category = await this.categoryRepository.create({
      data: {
        userId,
        ...dto,
        isSystem: false,
      },
    });

    return {
      message: 'Tạo danh mục thành công',
      data: category,
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

    // Kiểm tra tên mới không trùng với category khác
    if (dto.name && dto.name !== category.name) {
      const existed = await this.categoryRepository.findFirst({
        where: {
          userId,
          name: dto.name,
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

    const updatedCategory = await this.categoryRepository.update({
      where: {
        id: categoryId,
      },
      data: dto,
    });

    return {
      message: 'Cập nhật danh mục thành công',
      data: updatedCategory,
    };
  }

  async findAll(userId: string, query: PaginationDto) {
    const { page, limit, search, type, parentId, sortBy, order } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = {
      userId,
      deletedAt: null,
      ...(search && {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      }),
      ...(type && {
        type,
      }),
      ...(parentId !== undefined && {
        parentId: parentId || null,
      }),
    };

    const orderBy = sortBy ? { [sortBy]: order } : { name: 'asc' as const };

    const [categories, total] = await Promise.all([
      this.categoryRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          parent: {
            select: {
              id: true,
              name: true,
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
              name: true,
              icon: true,
              color: true,
            },
          },
        },
      }),
      this.categoryRepository.count({
        where,
      }),
    ]);

    return {
      message: 'Lấy danh sách danh mục thành công',
      data: categories,
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
            name: true,
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
            name: true,
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
      data: category,
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

    // Kiểm tra nếu category đang được sử dụng trong transaction (tuỳ chọn)
    // const transactionCount = await this.transactionRepository.count({
    //   where: {
    //     categoryId: categoryId,
    //     deletedAt: null,
    //   },
    // });
    //
    // if (transactionCount > 0) {
    //   throw new BadRequestException(
    //     'Không thể xóa danh mục vì đang được sử dụng trong giao dịch',
    //   );
    // }

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

  async getSystemCategories() {
    // Lấy tất cả category hệ thống
    const systemCategories = await this.categoryRepository.findMany({
      where: {
        isSystem: true,
        deletedAt: null,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Nếu chưa có category hệ thống nào, tạo mới
    if (systemCategories.length === 0) {
      // Không có system categories, trả về mặc định
      return {
        message: 'Danh sách category hệ thống mặc định',
        data: CATEGORY.SYSTEM_CATEGORIES,
      };
    }

    return {
      message: 'Lấy danh sách category hệ thống thành công',
      data: systemCategories,
    };
  }

  // Hàm khởi tạo category hệ thống cho user mới
  async initializeSystemCategoriesForUser(userId: string) {
    const systemCategories = await this.categoryRepository.findMany({
      where: {
        isSystem: true,
        deletedAt: null,
      },
    });

    // Nếu chưa có category hệ thống trong DB, tạo mới từ constants
    if (systemCategories.length === 0) {
      const categoriesToCreate = [
        ...CATEGORY.SYSTEM_CATEGORIES.EXPENSE.map((cat) => ({
          ...cat,
          type: CategoryType.EXPENSE,
          isSystem: true,
          userId: null, // System categories không thuộc về user cụ thể
        })),
        ...CATEGORY.SYSTEM_CATEGORIES.INCOME.map((cat) => ({
          ...cat,
          type: CategoryType.INCOME,
          isSystem: true,
          userId: null,
        })),
      ];

      await this.categoryRepository.createMany({
        data: categoriesToCreate,
      });
    }

    // Clone system categories cho user
    const systemCats = await this.categoryRepository.findMany({
      where: {
        isSystem: true,
        deletedAt: null,
      },
    });

    // Tạo bản sao cho user
    const userCategories = await this.categoryRepository.createMany({
      data: systemCats.map((cat) => ({
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: cat.type,
        userId: userId,
        isSystem: false, // Đánh dấu là của user, không phải system
        parentId: null,
      })),
    });

    return userCategories;
  }
}
