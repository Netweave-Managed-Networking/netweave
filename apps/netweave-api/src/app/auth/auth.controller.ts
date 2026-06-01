import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

import { IsEmail, MinLength } from 'class-validator';

export class AuthDto {
  @IsEmail()
  declare public email: string;

  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  declare public password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: AuthDto) {
    return this.authService.register(dto.email, dto.password);
  }

  @Post('login')
  login(@Body() dto: AuthDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
