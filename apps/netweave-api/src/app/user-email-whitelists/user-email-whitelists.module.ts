import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';
import { UserEmailWhitelist } from './user-email-whitelist.entity';
import { UserEmailWhitelistsController } from './user-email-whitelists.controller';
import { UserEmailWhitelistsService } from './user-email-whitelists.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEmailWhitelist]),
    AuthModule,
    MailModule,
  ],
  controllers: [UserEmailWhitelistsController],
  providers: [UserEmailWhitelistsService],
  exports: [UserEmailWhitelistsService],
})
export class UserEmailWhitelistsModule {}
