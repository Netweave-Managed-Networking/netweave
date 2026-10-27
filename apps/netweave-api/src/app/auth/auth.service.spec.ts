import { createHash } from 'crypto';

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';
import { OwnershipService } from './ownership.service';
import { RegistrationWhitelistService } from './registration-whitelist.service';

const mockJwtService = {
  sign: jest.fn().mockReturnValue('signed-token'),
  verify: jest.fn(),
};

const mockUserRepository = {
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

const mockRegistrationWhitelist = {
  findRoleFor: jest.fn(),
};

const mockMailService = {
  sendMail: jest.fn(),
};

const mockOwnership = {
  onEmailVerified: jest.fn(),
};

/** the token from the link in the last sent confirmation mail */
function mailedToken(): string {
  const { html } = mockMailService.sendMail.mock.calls.at(-1)[0];
  return html.match(/verify-email\/([\w-]+)/)[1];
}

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: typeof mockUserRepository;

  const originalEnv = process.env;

  beforeEach(async () => {
    process.env = { ...originalEnv, WEB_APP_URL: 'https://dev.netweave.de' };
    mockMailService.sendMail.mockResolvedValue(true);

    userRepo = {
      findOne: mockUserRepository.findOne,
      findOneBy: mockUserRepository.findOneBy,
      create: mockUserRepository.create,
      save: mockUserRepository.save,
      update: mockUserRepository.update,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: JwtService, useValue: mockJwtService },
        {
          provide: RegistrationWhitelistService,
          useValue: mockRegistrationWhitelist,
        },
        { provide: MailService, useValue: mockMailService },
        { provide: OwnershipService, useValue: mockOwnership },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerOrFail', () => {
    it('creates a new unverified user as viewer by default and sends the confirmation mail', async () => {
      mockRegistrationWhitelist.findRoleFor.mockResolvedValue(undefined);
      userRepo.findOneBy.mockResolvedValue(null);
      const savedUser = {
        id: 1,
        email: 'test@example.com',
        passwordHash: 'hash',
      } as User;
      userRepo.create.mockReturnValue(savedUser);
      userRepo.save.mockResolvedValue(savedUser);

      await service.registerOrFail('test@example.com', 'password');

      expect(userRepo.findOneBy).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(userRepo.create).toHaveBeenCalledWith({
        id: undefined,
        email: 'test@example.com',
        passwordHash: expect.any(String),
        role: 'viewer',
        emailVerifiedAt: null,
      });
      expect(userRepo.save).toHaveBeenCalledWith({
        ...savedUser,
        passwordHash: expect.any(String),
      });
      expect(userRepo.update).toHaveBeenCalledWith(1, {
        emailVerificationTokenHash: expect.any(String),
        emailVerificationExpiresAt: expect.any(Date),
      });
      expect(mockMailService.sendMail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Bestätige deine E-Mail-Adresse für Netweave',
        html: expect.stringContaining('https://dev.netweave.de/verify-email/'),
      });
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('mails a token that is valid for 12 hours and stores only its hash', async () => {
      mockRegistrationWhitelist.findRoleFor.mockResolvedValue(undefined);
      userRepo.findOneBy.mockResolvedValue(null);
      const savedUser = { id: 1, email: 'test@example.com' } as User;
      userRepo.create.mockReturnValue(savedUser);
      userRepo.save.mockResolvedValue(savedUser);

      const before = Date.now();
      await service.registerOrFail('test@example.com', 'password');

      const { emailVerificationTokenHash, emailVerificationExpiresAt } =
        userRepo.update.mock.calls[0][1];
      const token = mailedToken();
      expect(emailVerificationTokenHash).not.toEqual(token);
      expect(emailVerificationTokenHash).toEqual(
        createHash('sha256').update(token).digest('hex'),
      );
      expect(emailVerificationExpiresAt.getTime()).toBeGreaterThanOrEqual(
        before + 12 * 60 * 60 * 1000,
      );
    });

    it('creates the user with the role of the matching whitelist entry', async () => {
      mockRegistrationWhitelist.findRoleFor.mockResolvedValue('admin');
      userRepo.findOneBy.mockResolvedValue(null);
      const savedUser = { id: 1, email: 'boss@example.com' } as User;
      userRepo.create.mockReturnValue(savedUser);
      userRepo.save.mockResolvedValue(savedUser);

      await service.registerOrFail('boss@example.com', 'password');

      expect(mockRegistrationWhitelist.findRoleFor).toHaveBeenCalledWith(
        'boss@example.com',
      );
      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'admin' }),
      );
    });

    it('overwrites an existing unverified user, e.g. after the link expired', async () => {
      mockRegistrationWhitelist.findRoleFor.mockResolvedValue(undefined);
      userRepo.findOneBy.mockResolvedValue({
        id: 7,
        email: 'test@example.com',
        emailVerifiedAt: null,
      } as User);
      const savedUser = { id: 7, email: 'test@example.com' } as User;
      userRepo.create.mockReturnValue(savedUser);
      userRepo.save.mockResolvedValue(savedUser);

      await service.registerOrFail('test@example.com', 'new-password');

      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ id: 7, emailVerifiedAt: null }),
      );
      expect(mockMailService.sendMail).toHaveBeenCalledTimes(1);
    });

    it('throws ServiceUnavailableException when the confirmation mail fails', async () => {
      mockRegistrationWhitelist.findRoleFor.mockResolvedValue(undefined);
      userRepo.findOneBy.mockResolvedValue(null);
      const savedUser = { id: 1, email: 'test@example.com' } as User;
      userRepo.create.mockReturnValue(savedUser);
      userRepo.save.mockResolvedValue(savedUser);
      mockMailService.sendMail.mockResolvedValue(false);

      await expect(
        service.registerOrFail('test@example.com', 'password'),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
    });

    it('throws ForbiddenException when email is not whitelisted', async () => {
      mockRegistrationWhitelist.findRoleFor.mockResolvedValue(null);

      await expect(
        service.registerOrFail('test@example.com', 'password'),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(userRepo.findOneBy).not.toHaveBeenCalled();
      expect(userRepo.create).not.toHaveBeenCalled();
    });

    it('throws ConflictException when a verified user with the email exists', async () => {
      mockRegistrationWhitelist.findRoleFor.mockResolvedValue(undefined);
      userRepo.findOneBy.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        emailVerifiedAt: new Date(),
      } as User);

      await expect(
        service.registerOrFail('test@example.com', 'password'),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(userRepo.findOneBy).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(userRepo.create).not.toHaveBeenCalled();
      expect(mockMailService.sendMail).not.toHaveBeenCalled();
    });
  });

  describe('resendVerificationMailOrFail', () => {
    it('sends a new confirmation mail to an unverified user', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        emailVerifiedAt: null,
        emailVerificationExpiresAt: new Date(
          Date.now() + 12 * 60 * 60 * 1000 - 60 * 1000, // sent a minute ago
        ),
      } as User);

      await service.resendVerificationMailOrFail('test@example.com');

      expect(userRepo.update).toHaveBeenCalledWith(1, expect.any(Object));
      expect(mockMailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'test@example.com' }),
      );
    });

    it('does nothing within the cooldown after the last mail', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        emailVerifiedAt: null,
        emailVerificationExpiresAt: new Date(
          Date.now() + 12 * 60 * 60 * 1000 - 5 * 1000, // sent 5 seconds ago
        ),
      } as User);

      await service.resendVerificationMailOrFail('test@example.com');

      expect(mockMailService.sendMail).not.toHaveBeenCalled();
    });

    it.each([
      ['unknown', null],
      [
        'already verified',
        { id: 1, email: 'test@example.com', emailVerifiedAt: new Date() },
      ],
    ])('silently does nothing for %s emails', async (_, user) => {
      userRepo.findOne.mockResolvedValue(user);

      await expect(
        service.resendVerificationMailOrFail('test@example.com'),
      ).resolves.toBeUndefined();
      expect(mockMailService.sendMail).not.toHaveBeenCalled();
    });
  });

  describe('verifyEmailOrFail', () => {
    it('marks the email as verified, invalidates the token and returns an access token', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
      } as User);

      const result = await service.verifyEmailOrFail('the-token');

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: {
          emailVerificationTokenHash: createHash('sha256')
            .update('the-token')
            .digest('hex'),
          emailVerificationExpiresAt: expect.any(Object),
        },
        select: ['id', 'email', 'role'],
      });
      expect(userRepo.update).toHaveBeenCalledWith(1, {
        emailVerifiedAt: expect.any(Date),
        emailVerificationTokenHash: null,
        emailVerificationExpiresAt: null,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'test@example.com',
      });
      expect(result).toEqual('signed-token');
    });

    it('lets the ownership service decide whether the verified user becomes the owner', async () => {
      const user = { id: 1, email: 'admin@example.com', role: 'admin' } as User;
      userRepo.findOne.mockResolvedValue(user);

      await service.verifyEmailOrFail('the-token');

      expect(mockOwnership.onEmailVerified).toHaveBeenCalledWith(user);
    });

    it('throws BadRequestException for an unknown or expired token', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.verifyEmailOrFail('unknown-token'),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(userRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('loginOrFail', () => {
    it('returns an access token when credentials are valid', async () => {
      const existingUser = {
        id: 1,
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password', 10),
        emailVerifiedAt: new Date(),
      } as User;
      userRepo.findOne.mockResolvedValue(existingUser);

      const result = await service.loginOrFail('test@example.com', 'password');

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: expect.any(Array),
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: existingUser.id,
        email: existingUser.email,
      });
      expect(result).toEqual('signed-token');
    });

    it('throws ForbiddenException when the email is not verified yet', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password', 10),
        emailVerifiedAt: null,
      } as User);

      await expect(
        service.loginOrFail('test@example.com', 'password'),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when user is not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.loginOrFail('test@example.com', 'password'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: expect.any(Array),
      });
    });

    it('throws UnauthorizedException when password is invalid', async () => {
      const passwordHash = await bcrypt.hash('password', 10);
      const existingUser = {
        id: 1,
        email: 'test@example.com',
        passwordHash,
      } as User;
      userRepo.findOne.mockResolvedValue(existingUser);

      await expect(
        service.loginOrFail('test@example.com', 'wrong-password'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: expect.any(Array),
      });
    });
  });

  describe('getAuthenticatedUser', () => {
    it('returns authenticated user when token exists', async () => {
      const expectedUser = { id: 1, email: 'test@example.com' } as User;

      mockJwtService.verify.mockReturnValue({
        sub: expectedUser.id,
        email: expectedUser.email,
      });

      userRepo.findOneBy.mockResolvedValue(expectedUser);

      const result = await service.getAuthUserFromTokenOrFail('valid-token');

      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-token');
      expect(userRepo.findOneBy).toHaveBeenCalledWith({
        email: expectedUser.email,
      });
      expect(result).toEqual({
        sub: expectedUser.id,
        user: expectedUser,
      });
    });

    it('throws Invalid auth token when token invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(
        service.getAuthUserFromTokenOrFail('invalid-token'),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(mockJwtService.verify).toHaveBeenCalledWith('invalid-token');
    });
  });
});
