import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AccessToken, AuthService } from './auth.service';

import { UserAuthDTO } from '@netweave/api-types';
import { IsEmail, MinLength } from 'class-validator';
import { AuthGuard } from './auth.guard';
import { Me } from './me.decorator';

export class LoginUserDto {
  @IsEmail()
  declare public email: string;

  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  declare public password: string;
}

@Controller('auth')
export class AuthController {
  public constructor(private authService: AuthService) {}

  @Post('register')
  public async register(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserAuthDTO> | never {
    const token: AccessToken = await this.authService.registerOrFail(
      dto.email,
      dto.password,
    );
    const { name, options } = AuthService.COOKIE_CONSTS;
    res.cookie(name, token, options);
    return this.authService.getAuthUserFromTokenOrFail(token);
  }

  @Post('login')
  public async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserAuthDTO> | never {
    const token: AccessToken = await this.authService.loginOrFail(
      dto.email,
      dto.password,
    );
    const { name, options } = AuthService.COOKIE_CONSTS;
    res.cookie(name, token, options);
    return this.authService.getAuthUserFromTokenOrFail(token);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  public me(@Me() user: UserAuthDTO): UserAuthDTO {
    return user;
  }

  @Post('logout')
  public logout(@Res({ passthrough: true }) res: Response): { success: true } {
    const { name, options } = AuthService.COOKIE_CONSTS;
    res.clearCookie(name, options);
    return { success: true };
  }
}
