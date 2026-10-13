import { randomBytes } from 'crypto';

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { DEFAULT_USER_ROLE, UserAuthDTO } from '@netweave/api-types';
import * as bcrypt from 'bcrypt';
import { MoreThan, Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { User } from '../users/user.entity';
import { hashToken } from '../utils/hash-token';
import { RegistrationWhitelistService } from './registration-whitelist.service';

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
    private registrationWhitelist: RegistrationWhitelistService,
    private mailService: MailService,
  ) {}

  public static readonly EMAIL_VERIFICATION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
  public static readonly EMAIL_VERIFICATION_RESEND_COOLDOWN_MS = 30 * 1000;

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

  /**
   * creates an unverified user and sends the confirmation mail. An existing unverified user
   * is overwritten, so registering again works after the confirmation link expired or got lost.
   *
   * @throws ServiceUnavailableException when the confirmation mail could not be sent
   */
  public async registerOrFail(email: string, password: string): Promise<void> {
    // checked before the existence check so non-whitelisted emails can't probe for accounts
    const whitelistedRole = await this.registrationWhitelist.findRoleFor(email);
    if (whitelistedRole === null)
      throw new ForbiddenException('Email or domain is not whitelisted');

    const existing = await this.userRepo.findOneBy({ email });
    if (existing?.emailVerifiedAt)
      throw new ConflictException('Email already in use');

    const role = whitelistedRole ?? DEFAULT_USER_ROLE;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({
      id: existing?.id,
      email,
      passwordHash,
      role,
      emailVerifiedAt: null,
    });
    const saved = await this.userRepo.save({ ...user, passwordHash });
    await this.sendVerificationMailOrFail(saved);
  }

  /**
   * sends a new confirmation mail. Unknown or already verified emails and requests within the
   * cooldown are silently ignored, so the endpoint can't be used to probe for accounts or spam a mailbox.
   *
   * @throws ServiceUnavailableException when the confirmation mail could not be sent
   */
  public async resendVerificationMailOrFail(email: string): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { email },
      select: ['id', 'email', 'emailVerifiedAt', 'emailVerificationExpiresAt'],
    });
    if (!user || user.emailVerifiedAt) return;

    const sentAt = user.emailVerificationExpiresAt
      ? user.emailVerificationExpiresAt.getTime() -
        AuthService.EMAIL_VERIFICATION_TTL_MS
      : 0;
    if (Date.now() - sentAt < AuthService.EMAIL_VERIFICATION_RESEND_COOLDOWN_MS)
      return;

    await this.sendVerificationMailOrFail(user);
  }

  /**
   * marks the email of the token's user as verified and logs them in
   *
   * @throws BadRequestException when the token is unknown or expired
   */
  public async verifyEmailOrFail(token: string): Promise<AccessToken> {
    const user = await this.userRepo.findOne({
      where: {
        emailVerificationTokenHash: hashToken(token),
        emailVerificationExpiresAt: MoreThan(new Date()),
      },
      select: ['id', 'email'],
    });
    if (!user)
      throw new BadRequestException('Invalid or expired verification token');

    await this.userRepo.update(user.id, {
      emailVerifiedAt: new Date(),
      emailVerificationTokenHash: null,
      emailVerificationExpiresAt: null,
    });
    return this.sign(user);
  }

  public async loginOrFail(
    email: string,
    password: string,
  ): Promise<AccessToken> {
    const user: Pick<
      User,
      'id' | 'email' | 'passwordHash' | 'emailVerifiedAt'
    > | null = await this.userRepo.findOne({
      where: { email },
      select: ['id', 'email', 'passwordHash', 'emailVerifiedAt'],
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      throw new UnauthorizedException('Invalid credentials');
    // checked after the password so unverified accounts can't be probed for
    if (!user.emailVerifiedAt)
      throw new ForbiddenException('Email not verified');
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

  /** issues a new token, invalidating any earlier one, and mails the confirmation link */
  private async sendVerificationMailOrFail(
    user: Pick<User, 'id' | 'email'>,
  ): Promise<void> {
    const token = randomBytes(32).toString('base64url');
    await this.userRepo.update(user.id, {
      emailVerificationTokenHash: hashToken(token),
      emailVerificationExpiresAt: new Date(
        Date.now() + AuthService.EMAIL_VERIFICATION_TTL_MS,
      ),
    });

    const link = `${process.env.WEB_APP_URL}/verify-email/${token}`;
    const sent = await this.mailService.sendMail({
      to: user.email,
      subject: 'Bestätige deine E-Mail-Adresse für Netweave',
      html: verificationMailHtml(link),
    });
    if (!sent)
      throw new ServiceUnavailableException(
        'Verification mail could not be sent',
      );
  }
}

function verificationMailHtml(link: string): string {
  // table based button with inline styles, the only layout mail clients render reliably
  return `<p>Hallo,</p>
<p>bitte bestätige deine E-Mail-Adresse, um deine Registrierung bei Netweave abzuschließen.</p>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;">
  <tr>
    <td style="border-radius: 6px; background: #1f2937;">
      <a href="${link}" style="display: inline-block; padding: 16px 32px; font-family: sans-serif; font-size: 18px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 6px;">E-Mail-Adresse bestätigen</a>
    </td>
  </tr>
</table>
<p>Der Link ist 12 Stunden gültig. Falls der Button nicht funktioniert, öffne diesen Link:</p>
<p><a href="${link}">${link}</a></p>
<p>Falls du dich nicht bei Netweave registriert hast, kannst du diese Mail ignorieren.</p>`;
}
