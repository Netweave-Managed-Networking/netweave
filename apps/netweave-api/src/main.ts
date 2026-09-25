/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

// load .env variables as early as possible, must stay the first import
import './load-env';

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(3000);
  Logger.log(
    `🚀 Application is running on: http://localhost:3000/${globalPrefix}`,
  );
}

bootstrap();
