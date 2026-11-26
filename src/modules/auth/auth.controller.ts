import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import type { JwtPayload } from './jwt-payload';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { RefreshDto } from './dto/refresh.dto';

const AUTH_THROTTLE = { short: { limit: 5, ttl: 60_000 } };

@ApiTags('auth')
@Controller({ version: '1', path: 'auth' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('register')
  @ApiResponse({ status: 201, description: 'User registered' })
  @ApiResponse({ status: 409, description: 'EMAIL_TAKEN: email already used' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle(AUTH_THROTTLE)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Returns accessToken and refreshToken',
  })
  @ApiResponse({
    status: 401,
    description: 'INVALID_CREDENTIALS: wrong email or password',
  })
  @ApiResponse({ status: 429, description: 'Too many login attempts' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Revokes the given refresh token, returns a new token pair',
  })
  @ApiResponse({
    status: 401,
    description: 'INVALID_REFRESH_TOKEN: unknown, expired or revoked',
  })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Returns { id, email, role }' })
  @ApiResponse({ status: 401, description: 'MISSING_TOKEN or INVALID_TOKEN' })
  me(@CurrentUser() user: JwtPayload) {
    return { id: user.id, email: user.email, role: user.role };
  }

  @Get('admin')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Returns hello admin' })
  @ApiResponse({ status: 403, description: 'FORBIDDEN_ROLE' })
  @Roles(UserRole.Admin)
  getAdmin() {
    return { message: 'Hello admin' };
  }
}
