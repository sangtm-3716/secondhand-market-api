import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AppError } from '../../../common/app-error';
import { ErrorCode } from '../../../common/enums/error-code.enum';
import { UserRole } from '../../../common/enums/user-role.enum';
import { ROLES } from '../decorators/roles.decorator';
import { JwtPayload } from '../jwt-payload';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required?.length) return true;

    const req = ctx
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();
    const role = req.user?.role;
    if (!role || !required.includes(role)) {
      throw new AppError(
        ErrorCode.ForbiddenRole,
        "You don't have permission",
        HttpStatus.FORBIDDEN,
      );
    }
    return true;
  }
}
