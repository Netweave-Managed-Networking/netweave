import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { LlmConfigController } from './llm-config.controller';
import { LlmConfig } from './llm-config.entity';
import { LlmConfigService } from './llm-config.service';

@Module({
  imports: [TypeOrmModule.forFeature([LlmConfig]), AuthModule],
  controllers: [LlmConfigController],
  providers: [LlmConfigService],
  exports: [LlmConfigService],
})
export class LlmConfigModule {}
