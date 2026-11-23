import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';

@Injectable()
export class HealthService implements OnApplicationShutdown {
  private readonly logger = new Logger(HealthService.name);

  async onApplicationShutdown(signal?: string) {
    this.logger.log(`ON APPLICATION SHUTDOWN: ${signal}`);
    await new Promise((res) => setTimeout(res, 1000));
    this.logger.log('SHUTDOWN');
  }
}
