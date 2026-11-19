import { DataSource } from 'typeorm';
import { DEFAULT_DB_TYPE } from './common/constants/app.constants';
import { Category } from './entities/category.entity';
import { Order } from './entities/order.entity';
import { Post } from './entities/post.entity';
import { Review } from './entities/review.entity';
import { User } from './entities/user.entity';

process.loadEnvFile();

export default new DataSource({
  type: (process.env.DB_TYPE as typeof DEFAULT_DB_TYPE) ?? DEFAULT_DB_TYPE,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Category, Post, Order, Review],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
});
