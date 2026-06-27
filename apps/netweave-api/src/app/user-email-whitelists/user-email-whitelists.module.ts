import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserEmailWhitelist } from './user-email-whitelist.entity';
import { UserEmailWhitelistsController } from './user-email-whitelists.controller';
import { UserEmailWhitelistsService } from './user-email-whitelists.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEmailWhitelist]), AuthModule],
  controllers: [UserEmailWhitelistsController],
  providers: [UserEmailWhitelistsService],
  exports: [UserEmailWhitelistsService],
})
export class UserEmailWhitelistsModule {}
