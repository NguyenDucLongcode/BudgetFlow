import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserPreferenceRepository } from 'src/infrastructure/prisma/repositories';
import { CreateUserPreferenceDto } from './dto/CreateUserPreferenceDto';
import { UpdateUserPreferenceDto } from './dto/UpdateUserPreferenceDto';
import { USER_PREFERENCE } from './user-preference.constants';

@Injectable()
export class UserPreferenceService {
  constructor(
    private readonly userPreferenceRepository: UserPreferenceRepository,
  ) {}

  async create(userId: string, dto: CreateUserPreferenceDto) {
    // Kiểm tra xem user đã có preference chưa
    const existing = await this.userPreferenceRepository.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new BadRequestException(
        'User đã có cài đặt, vui lòng sử dụng update',
      );
    }

    // Tạo mới preference với dữ liệu từ dto hoặc giá trị mặc định
    const preference = await this.userPreferenceRepository.create({
      data: {
        userId,
        language: dto.language ?? USER_PREFERENCE.DEFAULT_LANGUAGE,
        currency: dto.currency ?? USER_PREFERENCE.DEFAULT_CURRENCY,
        theme: dto.theme ?? USER_PREFERENCE.DEFAULT_THEME,
        weekStartsOn:
          dto.weekStartsOn ?? USER_PREFERENCE.DEFAULT_WEEK_STARTS_ON,
        dateFormat: dto.dateFormat ?? USER_PREFERENCE.DEFAULT_DATE_FORMAT,
        timeFormat: dto.timeFormat ?? USER_PREFERENCE.DEFAULT_TIME_FORMAT,
        budgetNotification:
          dto.budgetNotification ?? USER_PREFERENCE.DEFAULT_BUDGET_NOTIFICATION,
        goalNotification:
          dto.goalNotification ?? USER_PREFERENCE.DEFAULT_GOAL_NOTIFICATION,
        debtNotification:
          dto.debtNotification ?? USER_PREFERENCE.DEFAULT_DEBT_NOTIFICATION,
        recurringNotification:
          dto.recurringNotification ??
          USER_PREFERENCE.DEFAULT_RECURRING_NOTIFICATION,
      },
    });

    return {
      message: 'Tạo cài đặt thành công',
      data: preference,
    };
  }

  async findOne(userId: string) {
    const preference = await this.userPreferenceRepository.findUnique({
      where: { userId },
    });

    if (!preference) {
      // Trả về preference mặc định nếu chưa có
      return {
        message: 'Lấy cài đặt thành công',
        data: {
          userId,
          ...USER_PREFERENCE,
        },
      };
    }

    return {
      message: 'Lấy cài đặt thành công',
      data: preference,
    };
  }

  async update(userId: string, dto: UpdateUserPreferenceDto) {
    // Kiểm tra xem preference có tồn tại không
    const existing = await this.userPreferenceRepository.findUnique({
      where: { userId },
    });

    if (!existing) {
      // Nếu chưa có, tạo mới với dữ liệu từ dto
      return this.create(userId, dto);
    }

    const updated = await this.userPreferenceRepository.update({
      where: { userId },
      data: dto,
    });

    return {
      message: 'Cập nhật cài đặt thành công',
      data: updated,
    };
  }

  async reset(userId: string) {
    const existing = await this.userPreferenceRepository.findUnique({
      where: { userId },
    });

    if (!existing) {
      throw new NotFoundException('Không tìm thấy cài đặt của user');
    }

    const reset = await this.userPreferenceRepository.update({
      where: { userId },
      data: {
        language: USER_PREFERENCE.DEFAULT_LANGUAGE,
        currency: USER_PREFERENCE.DEFAULT_CURRENCY,
        theme: USER_PREFERENCE.DEFAULT_THEME,
        weekStartsOn: USER_PREFERENCE.DEFAULT_WEEK_STARTS_ON,
        dateFormat: USER_PREFERENCE.DEFAULT_DATE_FORMAT,
        timeFormat: USER_PREFERENCE.DEFAULT_TIME_FORMAT,
        budgetNotification: USER_PREFERENCE.DEFAULT_BUDGET_NOTIFICATION,
        goalNotification: USER_PREFERENCE.DEFAULT_GOAL_NOTIFICATION,
        debtNotification: USER_PREFERENCE.DEFAULT_DEBT_NOTIFICATION,
        recurringNotification: USER_PREFERENCE.DEFAULT_RECURRING_NOTIFICATION,
      },
    });

    return {
      message: 'Đặt lại cài đặt thành công',
      data: reset,
    };
  }
}
