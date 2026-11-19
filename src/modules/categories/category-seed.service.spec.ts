import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from '../../entities/category.entity';
import { CategorySeedService } from './category-seed.service';

describe('CategorySeedService', () => {
  let service: CategorySeedService;
  const categoryRepository = {
    exists: jest.fn(),
    insert: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategorySeedService,
        {
          provide: getRepositoryToken(Category),
          useValue: categoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategorySeedService>(CategorySeedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('inserts categories when the table is empty', async () => {
    categoryRepository.exists.mockResolvedValue(false);

    await service.onModuleInit();

    expect(categoryRepository.insert).toHaveBeenCalledTimes(1);
  });

  it('skips seeding when categories already exist', async () => {
    categoryRepository.exists.mockResolvedValue(true);

    await service.onModuleInit();

    expect(categoryRepository.insert).not.toHaveBeenCalled();
  });

  it('does not throw when seeding fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    categoryRepository.exists.mockRejectedValue(new Error('db down'));

    await expect(service.onModuleInit()).resolves.toBeUndefined();
  });
});
