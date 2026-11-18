import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Order } from './entities/order.entity';
import { Post } from './entities/post.entity';
import { Review } from './entities/review.entity';
import { User } from './entities/user.entity';
import { CategoriesModule } from './modules/categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: Number(config.get<string>('DB_PORT')),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [User, Category, Post, Order, Review],
        synchronize: false,
      }),
    }),
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: 'CURRENCY', useValue: 'VND' },
    {
      provide: 'PRICE_LIMIT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const maxPriceEnv = configService.get<string>('MAX_PRICE');
        return maxPriceEnv ? Number(maxPriceEnv) : 100000000;
      },
    },
  ],
})
export class AppModule {}
