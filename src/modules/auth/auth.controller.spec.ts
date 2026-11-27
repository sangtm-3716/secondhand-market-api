import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { configureApp } from '../../configure-app';
import { UserRole } from '../../common/enums/user-role.enum';
import { RefreshToken } from '../../entities/refresh-token.entity';
import { User } from '../../entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

describe('Auth', () => {
  let app: INestApplication;
  let jwt: JwtService;

  const usersRepo = { findOneBy: jest.fn() };
  const refreshTokensRepo = { findOneBy: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test-secret' })],
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: usersRepo },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: refreshTokensRepo,
        },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    jwt = moduleRef.get(JwtService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns 409 for existing email', async () => {
    usersRepo.findOneBy.mockResolvedValue({ id: 1, email: 'a@x.com' });

    await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({ name: 'A', email: 'a@x.com', password: 'secret123' })
      .expect(409);
  });

  it('returns 401 for old refresh token', async () => {
    refreshTokensRepo.findOneBy.mockResolvedValue(null);

    await request(app.getHttpServer())
      .post('/v1/auth/refresh')
      .send({ refreshToken: 'old-token' })
      .expect(401);
  });

  it('returns 401 for protected routes', async () => {
    await request(app.getHttpServer()).get('/v1/auth/me').expect(401);
  });

  it('returns 403 for members calling admin routes', async () => {
    const memberToken = await jwt.signAsync({
      id: 1,
      email: 'a@x.com',
      role: UserRole.Member,
    });

    await request(app.getHttpServer())
      .get('/v1/auth/admin')
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(403);
  });
});
