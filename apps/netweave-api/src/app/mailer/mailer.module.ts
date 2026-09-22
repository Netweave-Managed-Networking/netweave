import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { MailConfig } from './mail-config.entity';
import { MailConfigController } from './mail-config.controller';
import { MailConfigService } from './mail-config.service';
import { MailerService } from './mailer.service';

@Module({
  imports: [TypeOrmModule.forFeature([MailConfig]), AuthModule],
  controllers: [MailConfigController],
  providers: [MailerService, MailConfigService],
  exports: [MailerService],
})
export class MailerModule {}
