import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { MailConfigController } from './mail-config.controller';
import { MailConfig } from './mail-config.entity';
import { MailConfigService } from './mail-config.service';
import { MailService } from './mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([MailConfig]), AuthModule],
  controllers: [MailConfigController],
  providers: [MailService, MailConfigService],
  exports: [MailService],
})
export class MailModule {}
