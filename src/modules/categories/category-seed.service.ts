import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../../entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategorySeedService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async onModuleInit() {
    try {
      const existingCategories = await this.categoryRepository.exists();

      if (existingCategories) return;

      await this.categoryRepository.insert([
        {
          name: 'Xe cộ',
          slug: 'xe-co',
        },
        {
          name: 'Đồ điện tử',
          slug: 'do-dien-tu',
        },
        {
          name: 'Nội thất',
          slug: 'noi-that',
        },
        {
          name: 'Sách',
          slug: 'sach',
        },
      ]);
    } catch (err) {
      console.error('Seeding failed: ', err);
    }
  }

  onModuleDestroy() {
    console.log('Module destroy');
  }
}
