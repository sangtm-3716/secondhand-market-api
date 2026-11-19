import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostStatus } from '../common/enums/post-status.enum';
import { numericStringTransformer } from './numeric-string.transformer';
import { Category } from './category.entity';
import { User } from './user.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'bigint', transformer: numericStringTransformer })
  price: number;

  @Column({ type: 'enum', enum: PostStatus, default: PostStatus.Available })
  status: PostStatus;

  @Column({ name: 'seller_id' })
  sellerId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @Column({ name: 'category_id' })
  categoryId: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
