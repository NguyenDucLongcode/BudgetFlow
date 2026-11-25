import { CategoryRepository } from 'src/infrastructure/prisma/repositories';
import { CategoryService } from './category.service';

describe('CategoryService.findAll', () => {
  it('queries categories without joins that can duplicate rows', async () => {
    const categories = [
      {
        id: 'category-1',
        nameVi: 'Ăn uống',
        nameEn: 'Food & Dining',
        name: 'Ăn uống',
        type: 'EXPENSE',
      },
    ];

    const findManyMock = jest.fn().mockResolvedValue(categories);
    const countMock = jest.fn().mockResolvedValue(1);

    const categoryRepository: Partial<CategoryRepository> = {
      findMany: findManyMock,
      count: countMock,
    };

    const service = new CategoryService(
      categoryRepository as CategoryRepository,
    );

    const result = await service.findAll('user-id', {
      page: 1,
      limit: 20,
    });

    expect(findManyMock).toHaveBeenCalledWith(
      expect.not.objectContaining({
        include: expect.anything(),
      }),
    );

    expect(result.data).toEqual(categories);
  });
});
