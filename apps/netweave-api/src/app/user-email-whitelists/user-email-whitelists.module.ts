import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEmailWhitelist } from './user-email-whitelist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEmailWhitelist])],
  controllers: [],
  providers: [],
  exports: [],
})
export class UserEmailWhitelistsModule {}
