import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableShutdownHooks();
  configureApp(app);

  const config = new DocumentBuilder()
    .setTitle('Secondhand Market API')
    .setDescription('API for buying and selling secondhand items')
    .setVersion('1.0')
    .addTag('app', 'placeholder endpoints serving basic content')
    .addTag('posts', 'Item listings')
    .addTag('orders', 'purchase orders')
    .addTag('reviews', 'buyer reviews after a completed order')
    .addTag('health', 'health check endpoint with db ping')
    .addTag('auth', 'register and login')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
