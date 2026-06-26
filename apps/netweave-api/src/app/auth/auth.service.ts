import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAuthDTO } from '@netweave/api-types';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

export type AccessToken = string;

export type CookieConsts = Readonly<{
  name: CookieName;
  options: CookieOptions;
}>;

export type CookieName = Readonly<string>;

export type CookieOptions = Readonly<{
  path: '/';
  httpOnly: true;
  sameSite: 'strict';
  secure: boolean;
  maxAge: number;
}>;

@Injectable()
export class AuthService {
  public constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  public static readonly COOKIE_CONSTS: CookieConsts = {
    name: 'netweave_auth_token',
    options: {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  };

  public async registerOrFail(
    email: string,
    password: string,
  ): Promise<AccessToken> {
    const existing = await this.userRepo.findOneBy({ email });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({ email, passwordHash, role: 'editor' });
    await this.userRepo.save({ ...user, passwordHash });
    return this.sign(user);
  }

  public async loginOrFail(
    email: string,
    password: string,
  ): Promise<AccessToken> {
    const user: Pick<User, 'id' | 'email' | 'passwordHash'> =
      await this.userRepo.findOneOrFail({
        where: { email },
        select: ['id', 'email', 'passwordHash'],
      });

    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      throw new UnauthorizedException('Invalid credentials');
    return this.sign(user);
  }

  public async getAuthUserFromCookieOrFail(
    cookie?: string,
  ): Promise<UserAuthDTO> {
    const token: AccessToken | null = this.readTokenFromCookie(cookie);
    if (!token) throw new UnauthorizedException('Missing auth cookie');
    return this.getAuthUserFromTokenOrFail(token);
  }

  public async getAuthUserFromTokenOrFail(token: string): Promise<UserAuthDTO> {
    try {
      type AuthPayload = { sub: number; email: string };
      const { sub, email } = this.jwtService.verify<AuthPayload>(token);
      const user = await this.userRepo.findOneBy({ email });
      if (!user) throw new UnauthorizedException('Invalid user');
      return { sub, user };
    } catch {
      throw new UnauthorizedException('Invalid auth token');
    }
  }

  private readTokenFromCookie(rawCookie?: string): AccessToken | null {
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
      .find((cookie) => cookie.name === AuthService.COOKIE_CONSTS.name);

    return cookiePair ? decodeURIComponent(cookiePair.value) : null;
  }

  private sign(user: Pick<User, 'id' | 'email'>): AccessToken {
    return this.jwtService.sign({ sub: user.id, email: user.email });
  }
}
