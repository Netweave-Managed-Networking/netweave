import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEmailWhitelist } from '../user-email-whitelists/user-email-whitelist.entity';
import { User } from '../users/user.entity';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { RegistrationWhitelistService } from './registration-whitelist.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserEmailWhitelist]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, RegistrationWhitelistService],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
