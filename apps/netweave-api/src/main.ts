/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
// load .env variables as early as possible
import * as dotenv from 'dotenv';
import * as path from 'path';

const envFile = process.env.NODE_ENV === 'e2e.api' ? '.env.e2e.api' : '.env';
dotenv.config({ path: path.resolve(__dirname, '../../..', envFile) });

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
