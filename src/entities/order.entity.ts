import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { numericStringTransformer } from './numeric-string.transformer';
import { Post } from './post.entity';
import { User } from './user.entity';

export enum OrderStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'post_id' })
  postId: number;

  @ManyToOne(() => Post)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @Column({ name: 'buyer_id' })
  buyerId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @Column({ type: 'bigint', transformer: numericStringTransformer })
  amount: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Pending })
  status: OrderStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
