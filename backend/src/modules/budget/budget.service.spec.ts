import { BadRequestException } from '@nestjs/common';
import { BudgetType, CategoryType } from 'generated/prisma/enums';
import {
  BudgetRepository,
  CategoryRepository,
  TransactionRepository,
} from 'src/infrastructure/prisma/repositories';
import { CreateBudgetDto } from './dto/CreateBudgetDto';
import { BudgetService } from './budget.service';

describe('BudgetService.create', () => {
  it('returns a friendly bad request when the same category and dates already exist', async () => {
    const existingBudget = { id: 'existing-budget' };

    const findFirstMock = jest.fn().mockResolvedValue(existingBudget);
    const createMock = jest.fn();

    const budgetRepository: BudgetRepository = Object.assign(
      Object.create(BudgetRepository.prototype),
      {
        findFirst: findFirstMock,
        create: createMock,
      },
    );

    const categoryFindFirstMock = jest
      .fn()
      .mockResolvedValue({ type: CategoryType.EXPENSE });

    const categoryRepository: CategoryRepository = Object.assign(
      Object.create(CategoryRepository.prototype),
      {
        findFirst: categoryFindFirstMock,
      },
    );

    const transactionRepository: TransactionRepository = Object.create(
      TransactionRepository.prototype,
    );

    const service = new BudgetService(
      budgetRepository,
      categoryRepository,
      transactionRepository,
    );

    const dto = {
      categoryId: 'category-id',
      amount: 1000,
      startDate: '2026-11-01T00:00:00.000Z',
      endDate: '2026-11-30T23:59:59.999Z',
      type: BudgetType.SPENDING,
    } as CreateBudgetDto;

    const creation = service.create('user-id', dto);

    await expect(creation).rejects.toBeInstanceOf(BadRequestException);
    await expect(creation).rejects.toThrow(
      'Đã tồn tại ngân sách cho danh mục này trong khoảng thời gian đã chọn.',
    );

    expect(findFirstMock).toHaveBeenCalledWith({
      where: {
        userId: 'user-id',
        categoryId: 'category-id',
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        deletedAt: null,
      },
      select: { id: true },
    });

    expect(createMock).not.toHaveBeenCalled();
  });
});

describe('BudgetService.remove', () => {
  it('hard deletes the budget instead of setting deletedAt', async () => {
    const findFirstMock = jest.fn().mockResolvedValue({ id: 'budget-id' });
    const deleteMock = jest.fn().mockResolvedValue({ id: 'budget-id' });
    const updateMock = jest.fn();

    const budgetRepository: BudgetRepository = Object.assign(
      Object.create(BudgetRepository.prototype),
      {
        findFirst: findFirstMock,
        delete: deleteMock,
        update: updateMock,
      },
    );

    const categoryRepository: CategoryRepository = Object.create(
      CategoryRepository.prototype,
    );

    const transactionRepository: TransactionRepository = Object.create(
      TransactionRepository.prototype,
    );

    const service = new BudgetService(
      budgetRepository,
      categoryRepository,
      transactionRepository,
    );

    await expect(service.remove('budget-id', 'user-id')).resolves.toEqual({
      message: 'Xóa ngân sách thành công',
    });

    expect(deleteMock).toHaveBeenCalledWith({
      where: { id: 'budget-id' },
    });

    expect(updateMock).not.toHaveBeenCalled();
  });
});
