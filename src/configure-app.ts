import { INestApplication, VersioningType } from '@nestjs/common';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

export function configureApp(app: INestApplication): void {
  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
}
