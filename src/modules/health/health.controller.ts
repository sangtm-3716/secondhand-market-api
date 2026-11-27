import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('health')
@Controller({ version: '1', path: 'health' })
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
  ) {}

  @Public()
  @SkipThrottle({ short: true })
  @Get()
  @HealthCheck()
  @ApiResponse({ status: 503, description: 'Health check failed' })
  check() {
    return this.health.check([() => this.db.pingCheck('database')]);
  }
}
