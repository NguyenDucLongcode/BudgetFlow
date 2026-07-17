import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  TransactionAttachmentRepository,
  TransactionRepository,
} from 'src/infrastructure/prisma/repositories';
import { CreateAttachmentDto } from '../dto/CreateAttachmentDto';

@Injectable()
export class TransactionAttachmentService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly transactionAttachmentRepository: TransactionAttachmentRepository,
  ) {}

  async addAttachment(
    transactionId: string,
    userId: string,
    dto: CreateAttachmentDto,
  ) {
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

    // Kiểm tra dung lượng file (ví dụ: max 10MB)
    if (dto.fileSize && dto.fileSize > 10 * 1024 * 1024) {
      throw new BadRequestException('File không được vượt quá 10MB');
    }

    const attachment = await this.transactionAttachmentRepository.create({
      data: {
        transactionId,
        fileName: dto.fileName,
        fileUrl: dto.fileUrl,
        mimeType: dto.mimeType,
        fileSize: dto.fileSize,
        type: dto.type,
      },
    });

    return {
      message: 'Thêm file đính kèm thành công',
      data: attachment,
    };
  }

  // =========================
  // LẤY DANH SÁCH ATTACHMENTS CỦA TRANSACTION
  // =========================
  async getAttachments(transactionId: string, userId: string) {
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

    const attachments = await this.transactionAttachmentRepository.findMany({
      where: {
        transactionId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      message: 'Lấy danh sách file đính kèm thành công',
      data: attachments,
    };
  }

  // =========================
  // LẤY CHI TIẾT 1 ATTACHMENT
  // =========================
  async getAttachment(
    transactionId: string,
    attachmentId: string,
    userId: string,
  ) {
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

    const attachment = await this.transactionAttachmentRepository.findFirst({
      where: {
        id: attachmentId,
        transactionId,
      },
    });

    if (!attachment) {
      throw new NotFoundException('Không tìm thấy file đính kèm');
    }

    return {
      message: 'Lấy thông tin file đính kèm thành công',
      data: attachment,
    };
  }

  // =========================
  // XÓA ATTACHMENT
  // =========================
  async removeAttachment(
    transactionId: string,
    attachmentId: string,
    userId: string,
  ) {
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

    const attachment = await this.transactionAttachmentRepository.findFirst({
      where: {
        id: attachmentId,
        transactionId,
      },
    });

    if (!attachment) {
      throw new NotFoundException('Không tìm thấy file đính kèm');
    }

    // TODO: Xóa file vật lý (nếu cần)
    // await this.storageService.deleteFile(attachment.fileUrl);

    await this.transactionAttachmentRepository.delete({
      where: {
        id: attachmentId,
      },
    });

    return {
      message: 'Xóa file đính kèm thành công',
    };
  }

  // =========================
  // XÓA TẤT CẢ ATTACHMENTS CỦA TRANSACTION
  // =========================
  async clearAttachments(transactionId: string, userId: string) {
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

    // Lấy danh sách files để xóa vật lý
    await this.transactionAttachmentRepository.findMany({
      where: {
        transactionId,
      },
    });

    // TODO: Xóa tất cả file vật lý
    // for (const att of attachments) {
    //   await this.storageService.deleteFile(att.fileUrl);
    // }

    const result = await this.transactionAttachmentRepository.deleteMany({
      where: {
        transactionId,
      },
    });

    return {
      message: `Đã xóa ${result.count} file đính kèm`,
      data: {
        deletedCount: result.count,
      },
    };
  }

  // =========================
  // CẬP NHẬT ATTACHMENT (ví dụ: đổi tên file)
  // =========================
  async updateAttachment(
    transactionId: string,
    attachmentId: string,
    userId: string,
    data: { fileName?: string },
  ) {
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

    const attachment = await this.transactionAttachmentRepository.findFirst({
      where: {
        id: attachmentId,
        transactionId,
      },
    });

    if (!attachment) {
      throw new NotFoundException('Không tìm thấy file đính kèm');
    }

    const updated = await this.transactionAttachmentRepository.update({
      where: {
        id: attachmentId,
      },
      data: {
        fileName: data.fileName,
      },
    });

    return {
      message: 'Cập nhật file đính kèm thành công',
      data: updated,
    };
  }
}
