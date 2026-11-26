import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AppError } from '../../common/app-error';
import { ErrorCode } from '../../common/enums/error-code.enum';
import { User } from '../../entities/user.entity';
import { RegisterDto } from './dto/register.dto';

const BCRYPT_COST = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.users.findOneBy({ email: dto.email });
    if (existing) {
      throw new AppError(
        ErrorCode.EmailTaken,
        'Email is already registered',
        HttpStatus.CONFLICT,
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_COST);
    const user = await this.users.save(
      this.users.create({ name: dto.name, email: dto.email, passwordHash }),
    );

    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }
}
