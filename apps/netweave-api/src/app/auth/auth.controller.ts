import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

import { IsEmail, MinLength } from 'class-validator';

const COOKIE_NAME = 'netweave_auth_token';
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

type CookieOptions = {
  path: '/';
  httpOnly: true;
  sameSite: 'strict';
  secure: boolean;
  maxAge: number;
};

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
  ): Promise<{ success: true }> | never {
    const { access_token } = await this.authService.register(
      dto.email,
      dto.password,
    );
    res.cookie(COOKIE_NAME, access_token, this.getAuthCookieOptions());
    return { success: true };
  }

  @Post('login')
  public async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: true }> | never {
    const { access_token } = await this.authService.login(
      dto.email,
      dto.password,
    );
    res.cookie(COOKIE_NAME, access_token, this.getAuthCookieOptions());
    return { success: true };
  }

  @Get('me')
  public async me(@Req() req: Request): Promise<{ email: string }> | never {
    const token = this.getTokenFromRequest(req);
    if (!token) throw new UnauthorizedException('Missing auth cookie');

    const { email } = this.authService.verifyToken(token);
    return { email };
  }

  @Post('logout')
  public logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAME, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    return { success: true };
  }

  private getAuthCookieOptions(): CookieOptions {
    return {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: COOKIE_MAX_AGE_MS,
    } as const;
  }

  private getTokenFromRequest(req: Request): string | null {
    const rawCookie = req.headers.cookie;
    if (!rawCookie) return null;

    const cookiePair = rawCookie
      .split(';')
      .map((cookie) => cookie.trim())
      .map((cookie) => {
        const index = cookie.indexOf('=');
        return {
          name: cookie.slice(0, index),
          value: cookie.slice(index + 1),
        };
      })
      .find((cookie) => cookie.name === COOKIE_NAME);

    return cookiePair ? decodeURIComponent(cookiePair.value) : null;
  }
}
