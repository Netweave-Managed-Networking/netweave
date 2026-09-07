import { Module } from '@nestjs/common';
import { HealthCheckController } from './health-check.controller';

/**
 * only purpose of HealthCheckModule is to check whether api is currently up and running
 */
@Module({ controllers: [HealthCheckController] })
export class HealthCheckModule {}
