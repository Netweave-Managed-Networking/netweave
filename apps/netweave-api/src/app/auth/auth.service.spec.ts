import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';

const mockJwtService = {
  sign: jest.fn().mockReturnValue('signed-token'),
  verify: jest.fn(),
};

const mockUserRepository = {
  findOneOrFail: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: typeof mockUserRepository;

  beforeEach(async () => {
    userRepo = {
      findOneOrFail: mockUserRepository.findOneOrFail,
      findOneBy: mockUserRepository.findOneBy,
      create: mockUserRepository.create,
      save: mockUserRepository.save,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerOrFail', () => {
    it('creates a new user as editor and returns an access token', async () => {
      userRepo.findOneBy.mockResolvedValue(undefined);
      const savedUser = {
        id: 1,
        email: 'test@example.com',
        passwordHash: 'hash',
      } as User;
      userRepo.create.mockReturnValue(savedUser);
      userRepo.save.mockResolvedValue(savedUser);

      const result = await service.registerOrFail(
        'test@example.com',
        'password',
      );

      expect(userRepo.findOneBy).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(userRepo.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        passwordHash: expect.any(String),
        role: 'editor',
      });
      expect(userRepo.save).toHaveBeenCalledWith({
        ...savedUser,
        passwordHash: expect.any(String),
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: savedUser.id,
        email: savedUser.email,
      });
      expect(result).toEqual('signed-token');
    });

    it('throws ConflictException when email already exists', async () => {
      userRepo.findOneBy.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
      } as User);

      await expect(
        service.registerOrFail('test@example.com', 'password'),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(userRepo.findOneBy).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(userRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('loginOrFail', () => {
    it('returns an access token when credentials are valid', async () => {
      const existingUser = {
        id: 1,
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password', 10),
      } as User;
      userRepo.findOneOrFail.mockResolvedValue(existingUser);

      const result = await service.loginOrFail('test@example.com', 'password');

      expect(userRepo.findOneOrFail).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: expect.any(Array),
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: existingUser.id,
        email: existingUser.email,
      });
      expect(result).toEqual('signed-token');
    });

    it('throws UnauthorizedException when user is not found', async () => {
      userRepo.findOneOrFail.mockResolvedValue(undefined);

      await expect(
        service.loginOrFail('test@example.com', 'password'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(userRepo.findOneOrFail).toHaveBeenCalledWith({
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
      userRepo.findOneOrFail.mockResolvedValue(existingUser);

      await expect(
        service.loginOrFail('test@example.com', 'wrong-password'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(userRepo.findOneOrFail).toHaveBeenCalledWith({
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
