import { Module } from '@nestjs/common';
import { CategorySeedService } from './category-seed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../../entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  providers: [CategorySeedService],
})
export class CategoriesModule {}
