import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  const healthCheckService = {
    check: jest.fn(),
  };
  const typeOrmHealthIndicator = {
    pingCheck: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: healthCheckService },
        { provide: TypeOrmHealthIndicator, useValue: typeOrmHealthIndicator },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('runs a database ping check', async () => {
    const result = { status: 'ok', details: { database: { status: 'up' } } };
    healthCheckService.check.mockImplementation(
      (indicators: (() => unknown)[]) =>
        Promise.all(indicators.map((indicator) => indicator())).then(
          () => result,
        ),
    );
    typeOrmHealthIndicator.pingCheck.mockResolvedValue({
      database: { status: 'up' },
    });

    await expect(controller.check()).resolves.toEqual(result);
    expect(typeOrmHealthIndicator.pingCheck).toHaveBeenCalledWith('database');
  });

  it('propagates failure when the database is down', async () => {
    healthCheckService.check.mockRejectedValue(new Error('database down'));

    await expect(controller.check()).rejects.toThrow('database down');
  });
});
