import { BadRequestException } from '@nestjs/common';
import { BudgetType, CategoryType } from 'generated/prisma/enums';
import { BudgetRepository, CategoryRepository } from 'src/infrastructure/prisma/repositories';
import { CreateBudgetDto } from './dto/CreateBudgetDto';
import { BudgetService } from './budget.service';

describe('BudgetService.create', () => {
  it('returns a friendly bad request when the same category and dates already exist', async () => {
    const existingBudget = { id: 'existing-budget' };
    const budgetRepository = {
      findFirst: jest.fn().mockResolvedValue(existingBudget),
      create: jest.fn(),
    } as unknown as BudgetRepository;
    const categoryRepository = {
      findFirst: jest.fn().mockResolvedValue({ type: CategoryType.EXPENSE }),
    } as unknown as CategoryRepository;
    const service = new BudgetService(budgetRepository, categoryRepository);
    const dto = {
      categoryId: 'category-id',
      amount: 1000,
      startDate: '2026-11-01T00:00:00.000Z',
      endDate: '2026-11-30T23:59:59.999Z',
      type: BudgetType.SPENDING,
    } as CreateBudgetDto;

    const creation = service.create('user-id', dto);
    await expect(creation).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(creation).rejects.toThrow(
      'Đã tồn tại ngân sách cho danh mục này trong khoảng thời gian đã chọn.',
    );
    expect(budgetRepository.findFirst).toHaveBeenCalledWith({
      where: {
        userId: 'user-id',
        categoryId: 'category-id',
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        deletedAt: null,
      },
      select: { id: true },
    });
    expect(budgetRepository.create).not.toHaveBeenCalled();
  });
});

describe('BudgetService.remove', () => {
  it('hard deletes the budget instead of setting deletedAt', async () => {
    const budgetRepository = {
      findFirst: jest.fn().mockResolvedValue({ id: 'budget-id' }),
      delete: jest.fn().mockResolvedValue({ id: 'budget-id' }),
      update: jest.fn(),
    } as unknown as BudgetRepository;
    const categoryRepository = {} as CategoryRepository;
    const service = new BudgetService(budgetRepository, categoryRepository);

    await expect(service.remove('budget-id', 'user-id')).resolves.toEqual({
      message: 'Xóa ngân sách thành công',
    });
    expect(budgetRepository.delete).toHaveBeenCalledWith({
      where: { id: 'budget-id' },
    });
    expect(budgetRepository.update).not.toHaveBeenCalled();
  });
});
