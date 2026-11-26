import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { AppError } from '../../common/app-error';
import { ErrorCode } from '../../common/enums/error-code.enum';
import { RefreshToken } from '../../entities/refresh-token.entity';
import { User } from '../../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';

const BCRYPT_COST = 10;
const REFRESH_TOKEN_BYTES = 32;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const sha256Hex = (value: string) =>
  createHash('sha256').update(value).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokens: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
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

  async login(dto: LoginDto) {
    const user = await this.users.findOneBy({ email: dto.email });

    const passwordOk =
      user && (await bcrypt.compare(dto.password, user.passwordHash));
    if (!user || !passwordOk) {
      throw new AppError(
        ErrorCode.InvalidCredentials,
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.issueTokens(user);
  }

  async refresh({ refreshToken }: RefreshDto) {
    const invalid = () =>
      new AppError(
        ErrorCode.InvalidRefreshToken,
        'Refresh token is invalid, expired or revoked',
        HttpStatus.UNAUTHORIZED,
      );

    if (typeof refreshToken !== 'string' || !refreshToken) throw invalid();

    const tokenHash = sha256Hex(refreshToken);
    const stored = await this.refreshTokens.findOneBy({
      tokenHash,
      revokedAt: IsNull(),
      expiresAt: MoreThan(new Date()),
    });
    if (!stored) throw invalid();

    const { affected } = await this.refreshTokens.update(
      { id: stored.id, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
    if (affected !== 1) throw invalid();

    const user = await this.users.findOneBy({ id: stored.userId });
    if (!user) throw invalid();

    return this.issueTokens(user);
  }

  private async issueTokens(user: User) {
    const accessToken = await this.jwtService.signAsync({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
    await this.refreshTokens.insert({
      userId: user.id,
      tokenHash: sha256Hex(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });

    return { accessToken, refreshToken };
  }
}
