import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { WalletRepository } from 'src/infrastructure/prisma/repositories';
import { CreateWalletDto } from './dto/CreateWalletDto';
import { WALLET } from './wallet.constants';
import { UpdateWalletDto } from './dto/UpdateWalletDto';
import { WalletType } from 'generated/prisma/enums';
import { PaginationDto } from './dto/PaginationDto';
import { Prisma } from 'generated/prisma/client';

@Injectable()
export class WalletService {
  constructor(private readonly walletRepository: WalletRepository) {}

  async create(userId: string, dto: CreateWalletDto) {
    // Đếm số ví hiện tại của user
    const walletCount = await this.walletRepository.count({
      where: {
        userId,
        deletedAt: null,
      },
    });

    const maxWallets =
      Number(process.env.MAX_WALLETS_PER_USER) || WALLET.MAX_WALLETS || 5;

    if (walletCount >= maxWallets) {
      throw new BadRequestException({
        statusCode: 400,
        message: `Bạn chỉ được tạo tối đa ${maxWallets} ví`,
        error: 'MAX_WALLETS_REACHED',
        maxWallets,
      });
    }
    // kiểm tra tên ví đã tồn tại chưa
    const existed = await this.walletRepository.findFirst({
      where: {
        userId,
        name: dto.name,
        deletedAt: null,
      },
    });

    if (existed) {
      throw new BadRequestException('Tên ví đã tồn tại');
    }

    if (
      dto.type !== WalletType.BANK &&
      (dto.bankName || dto.accountNumber || dto.accountName)
    ) {
      throw new BadRequestException(
        'Chỉ ví ngân hàng mới được nhập thông tin tài khoản',
      );
    }

    const isDefault = walletCount === 0 || dto.isDefault === true;
    const wallet = await this.walletRepository.prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.wallet.updateMany({
          where: { userId, deletedAt: null, isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.wallet.create({
        data: {
          userId,
          name: dto.name,
          type: dto.type,
          currency: dto.currency,
          balance: dto.initialBalance ?? 0,
          initialBalance: dto.initialBalance ?? 0,
          icon: dto.icon,
          color: dto.color,
          bankName: dto.bankName,
          accountNumber: dto.accountNumber,
          accountName: dto.accountName,
          description: dto.description,
          isDefault,
          autoSync: dto.autoSync,
        },
      });
    });

    return {
      message: 'Tạo ví thành công',
      data: wallet,
    };
  }

  async update(walletId: string, userId: string, dto: UpdateWalletDto) {
    // Kiểm tra xem ví có tồn tại và thuộc về user hay không
    const wallet = await this.walletRepository.findFirst({
      where: {
        id: walletId,
        userId,
        deletedAt: null,
      },
    });

    if (!wallet) {
      throw new NotFoundException('Không tìm thấy ví');
    }

    // Kiểm tra nếu tên ví được cập nhật và khác với tên hiện tại thì kiểm tra xem tên ví đã tồn tại chưa
    if (dto.name && dto.name !== wallet.name) {
      const existed = await this.walletRepository.findFirst({
        where: {
          userId,
          name: dto.name,
          deletedAt: null,
          NOT: {
            id: walletId,
          },
        },
      });

      if (existed) {
        throw new BadRequestException('Tên ví đã tồn tại');
      }
    }

    // Kiểm tra nếu ví không phải là ví ngân hàng mà có thông tin tài khoản ngân hàng thì báo lỗi
    if (
      wallet.type !== WalletType.BANK &&
      (dto.bankName || dto.accountNumber || dto.accountName)
    ) {
      throw new BadRequestException(
        'Chỉ ví ngân hàng mới được cập nhật thông tin tài khoản',
      );
    }

    // Kiểm tra nếu ví là ví ngân hàng mà không có thông tin tài khoản ngân hàng thì báo lỗi
    const {
      isArchived,
      ...walletData
    } = dto;
    const updatedWallet = await this.walletRepository.update({
      where: {
        id: walletId,
      },
      data: {
        ...walletData,
        ...(isArchived !== undefined && {
          isArchived,
          archivedAt: isArchived ? new Date() : null,
        }),
      },
    });

    return {
      message: 'Cập nhật ví thành công',
      data: updatedWallet,
    };
  }

  async findAll(userId: string, query: PaginationDto) {
    const {
      page,
      limit,
      search,
      type,
      isDefault,
      isArchived,
      sortBy,
      order,
    } = query;

    // Tính toán số lượng bản ghi cần bỏ qua dựa trên trang hiện tại và giới hạn
    const skip = (page - 1) * limit;

    // Tạo điều kiện lọc ví dựa trên các tham số truy vấn
    const where: Prisma.WalletWhereInput = {
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

      ...(isDefault !== undefined && {
        isDefault,
      }),

      ...(isArchived !== undefined && {
        isArchived,
      }),
    };

    // Tạo điều kiện sắp xếp dựa trên tham số sortBy và order
    const orderBy = sortBy ? { [sortBy]: order } : { id: 'asc' as const };

    // Sử dụng Promise.all để thực hiện hai truy vấn song song: tìm kiếm danh sách ví và đếm tổng số ví
    const [wallets, total] = await Promise.all([
      this.walletRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy,

        select: {
          id: true,
          name: true,
          type: true,
          balance: true,
          initialBalance: true,
          currency: true,
          icon: true,
          color: true,
          description: true,
          isDefault: true,
          isArchived: true,
          autoSync: true,
          createdAt: true,
        },
      }),

      this.walletRepository.count({
        where,
      }),
    ]);

    return {
      message: 'Lấy danh sách ví thành công',

      data: wallets,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(walletId: string, userId: string) {
    const wallet = await this.walletRepository.findFirst({
      where: {
        id: walletId,
        userId,
        deletedAt: null,
      },
    });

    if (!wallet) {
      throw new NotFoundException('Không tìm thấy ví');
    }

    return {
      message: 'Lấy thông tin ví thành công',
      data: wallet,
    };
  }

  async remove(walletId: string, userId: string) {
    const wallet = await this.walletRepository.findFirst({
      where: {
        id: walletId,
        userId,
        deletedAt: null,
      },
    });

    if (!wallet) {
      throw new NotFoundException('Không tìm thấy ví');
    }

    if (wallet.isDefault) {
      throw new BadRequestException('Không thể xóa ví mặc định');
    }

    await this.walletRepository.update({
      where: {
        id: walletId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      message: 'Xóa ví thành công',
    };
  }

  async setDefault(walletId: string, userId: string) {
    const wallet = await this.walletRepository.findFirst({
      where: {
        id: walletId,
        userId,
        deletedAt: null,
      },
    });

    if (!wallet) {
      throw new NotFoundException('Không tìm thấy ví');
    }

    if (wallet.isDefault) {
      return {
        message: 'Ví này đã là ví mặc định',
      };
    }

    await this.walletRepository.prisma.$transaction(async (tx) => {
      // Bỏ mặc định tất cả ví của user
      await tx.wallet.updateMany({
        where: {
          userId,
          deletedAt: null,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });

      // Đặt ví hiện tại thành mặc định
      await tx.wallet.update({
        where: {
          id: walletId,
        },
        data: {
          isDefault: true,
        },
      });
    });

    return {
      message: 'Đặt ví mặc định thành công',
    };
  }
}
