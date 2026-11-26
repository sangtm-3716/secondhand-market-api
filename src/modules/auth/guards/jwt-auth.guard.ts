import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AppError } from '../../../common/app-error';
import { ErrorCode } from '../../../common/enums/error-code.enum';
import { IS_PUBLIC } from '../decorators/public.decorator';
import { JwtPayload } from '../jwt-payload';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const req = ctx
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();

    const [scheme, token] = req.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) {
      throw new AppError(
        ErrorCode.MissingToken,
        'Missing or malformed Authorization header',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      req.user = await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      throw new AppError(
        ErrorCode.InvalidToken,
        'Token is invalid or expired',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return true;
  }
}
