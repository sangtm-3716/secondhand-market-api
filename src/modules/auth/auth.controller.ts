import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import type { JwtPayload } from './jwt-payload';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('auth')
@Controller({ version: '1', path: 'auth' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiResponse({ status: 201, description: 'User registered' })
  @ApiResponse({ status: 409, description: 'EMAIL_TAKEN: email already used' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Returns accessToken' })
  @ApiResponse({
    status: 401,
    description: 'INVALID_CREDENTIALS: wrong email or password',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
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
