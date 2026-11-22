import { CategoryRepository } from 'src/infrastructure/prisma/repositories';
import { CategoryService } from './category.service';
import { PaginationDto } from './dto/PaginationDto';

describe('CategoryService.findAll', () => {
  it('queries categories without joins that can duplicate rows', async () => {
    const categories = [
      { id: 'category-1', name: 'Ăn uống', type: 'EXPENSE' },
    ];
    const categoryRepository = {
      findMany: jest.fn().mockResolvedValue(categories),
      count: jest.fn().mockResolvedValue(1),
    } as unknown as CategoryRepository;
    const service = new CategoryService(categoryRepository);

    const result = await service.findAll('user-id', {
      page: 1,
      limit: 20,
    } as PaginationDto);

    expect(categoryRepository.findMany).toHaveBeenCalledWith(
      expect.not.objectContaining({
        include: expect.anything(),
      }),
    );
    expect(result.data).toEqual(categories);
  });
});
