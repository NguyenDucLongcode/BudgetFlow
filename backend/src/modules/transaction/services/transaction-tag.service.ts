import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  TransactionRepository,
  TransactionTagRepository,
} from 'src/infrastructure/prisma/repositories';
@Injectable()
export class TransactionTagService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly tagRepository: TransactionRepository,
    private readonly transactionTagRepository: TransactionTagRepository,
  ) {}

  // =========================
  // THÊM TAG VÀO TRANSACTION
  // =========================
  async addTags(transactionId: string, userId: string, tagIds: string[]) {
    // Kiểm tra transaction tồn tại và thuộc về user
    const transaction = await this.transactionRepository.findFirst({
      where: {
        id: transactionId,
        userId,
        deletedAt: null,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Không tìm thấy giao dịch');
    }

    // Kiểm tra tags tồn tại và thuộc về user
    const tags = await this.tagRepository.findMany({
      where: {
        id: { in: tagIds },
        userId,
      },
    });

    if (tags.length !== tagIds.length) {
      throw new BadRequestException(
        'Một số tag không tồn tại hoặc không thuộc về bạn',
      );
    }

    // Thêm tags vào transaction
    const transactionTags = await this.transactionTagRepository.createMany({
      data: tagIds.map((tagId) => ({
        transactionId,
        tagId,
      })),
      skipDuplicates: true,
    });

    return {
      message: `Đã thêm ${transactionTags.count} tag vào giao dịch`,
      data: {
        added: transactionTags.count,
      },
    };
  }

  // =========================
  // XÓA TAG KHỎI TRANSACTION
  // =========================
  async removeTag(transactionId: string, tagId: string, userId: string) {
    // Kiểm tra transaction tồn tại
    const transaction = await this.transactionRepository.findFirst({
      where: {
        id: transactionId,
        userId,
        deletedAt: null,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Không tìm thấy giao dịch');
    }

    // Kiểm tra tag tồn tại trong transaction
    const transactionTag = await this.transactionTagRepository.findUnique({
      where: {
        transactionId_tagId: {
          transactionId,
          tagId,
        },
      },
    });

    if (!transactionTag) {
      throw new NotFoundException('Tag không tồn tại trong giao dịch này');
    }

    await this.transactionTagRepository.delete({
      where: {
        transactionId_tagId: {
          transactionId,
          tagId,
        },
      },
    });

    return {
      message: 'Đã xóa tag khỏi giao dịch',
    };
  }

  // =========================
  // CẬP NHẬT TOÀN BỘ TAGS (REPLACE)
  // =========================
  async updateTags(transactionId: string, userId: string, tagIds: string[]) {
    // Kiểm tra transaction
    const transaction = await this.transactionRepository.findFirst({
      where: {
        id: transactionId,
        userId,
        deletedAt: null,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Không tìm thấy giao dịch');
    }

    // Kiểm tra tags
    if (tagIds.length > 0) {
      const tags = await this.tagRepository.findMany({
        where: {
          id: { in: tagIds },
          userId,
        },
      });

      if (tags.length !== tagIds.length) {
        throw new BadRequestException('Một số tag không tồn tại');
      }
    }

    // Xóa tất cả tags cũ
    await this.transactionTagRepository.deleteMany({
      where: {
        transactionId,
      },
    });

    // Thêm tags mới
    if (tagIds.length > 0) {
      await this.transactionTagRepository.createMany({
        data: tagIds.map((tagId) => ({
          transactionId,
          tagId,
        })),
      });
    }

    return {
      message: 'Cập nhật tags thành công',
      data: {
        total: tagIds.length,
      },
    };
  }

  // =========================
  // LẤY TAGS CỦA TRANSACTION
  // =========================
  async getTags(transactionId: string, userId: string) {
    const transaction = await this.transactionRepository.findFirst({
      where: {
        id: transactionId,
        userId,
        deletedAt: null,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Không tìm thấy giao dịch');
    }

    const transactionTags = await this.transactionTagRepository.findMany({
      where: {
        transactionId,
      },
      include: {
        tag: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    return {
      message: 'Lấy danh sách tags thành công',
      data: transactionTags.map((tt) => tt.tag),
    };
  }
}
