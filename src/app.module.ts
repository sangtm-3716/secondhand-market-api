import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  DEFAULT_DB_TYPE,
  DEFAULT_MAX_PRICE,
  THROTTLE_LIMIT,
  THROTTLE_TTL_MS,
} from './common/constants/app.constants';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Order } from './entities/order.entity';
import { Post } from './entities/post.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Review } from './entities/review.entity';
import { User } from './entities/user.entity';
import { CategoriesModule } from './modules/categories/categories.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: THROTTLE_TTL_MS, limit: THROTTLE_LIMIT },
    ]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: config.get<typeof DEFAULT_DB_TYPE>('DB_TYPE', DEFAULT_DB_TYPE),
        host: config.get<string>('DB_HOST'),
        port: Number(config.get<string>('DB_PORT')),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [User, Category, Post, Order, Review, RefreshToken],
        synchronize: false,
      }),
    }),
    CategoriesModule,
    HealthModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: 'CURRENCY', useValue: 'VND' },
    {
      provide: 'PRICE_LIMIT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const maxPriceEnv = configService.get<string>('MAX_PRICE');
        return maxPriceEnv ? Number(maxPriceEnv) : DEFAULT_MAX_PRICE;
      },
    },
  ],
})
export class AppModule {}
