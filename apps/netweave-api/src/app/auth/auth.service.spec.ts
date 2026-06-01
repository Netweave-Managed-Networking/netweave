import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';

const mockJwtService = {
  sign: jest.fn().mockReturnValue('signed-token'),
};

const mockUserRepository = {
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: typeof mockUserRepository;

  beforeEach(async () => {
    userRepo = {
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

  describe('register', () => {
    it('creates a new user and returns an access token', async () => {
      userRepo.findOneBy.mockResolvedValue(undefined);
      const savedUser = {
        id: 1,
        email: 'test@example.com',
        passwordHash: 'hash',
      } as User;
      userRepo.create.mockReturnValue(savedUser);
      userRepo.save.mockResolvedValue(savedUser);

      const result = await service.register('test@example.com', 'password');

      expect(userRepo.findOneBy).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(userRepo.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        passwordHash: expect.any(String),
      });
      expect(userRepo.save).toHaveBeenCalledWith(savedUser);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: savedUser.id,
        email: savedUser.email,
      });
      expect(result).toEqual({ access_token: 'signed-token' });
    });

    it('throws ConflictException when email already exists', async () => {
      userRepo.findOneBy.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
      } as User);

      await expect(
        service.register('test@example.com', 'password'),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(userRepo.findOneBy).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(userRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns an access token when credentials are valid', async () => {
      const passwordHash = await bcrypt.hash('password', 10);
      const existingUser = {
        id: 1,
        email: 'test@example.com',
        passwordHash,
      } as User;
      userRepo.findOneBy.mockResolvedValue(existingUser);

      const result = await service.login('test@example.com', 'password');

      expect(userRepo.findOneBy).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: existingUser.id,
        email: existingUser.email,
      });
      expect(result).toEqual({ access_token: 'signed-token' });
    });

    it('throws UnauthorizedException when user is not found', async () => {
      userRepo.findOneBy.mockResolvedValue(undefined);

      await expect(
        service.login('test@example.com', 'password'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(userRepo.findOneBy).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });

    it('throws UnauthorizedException when password is invalid', async () => {
      const passwordHash = await bcrypt.hash('password', 10);
      const existingUser = {
        id: 1,
        email: 'test@example.com',
        passwordHash,
      } as User;
      userRepo.findOneBy.mockResolvedValue(existingUser);

      await expect(
        service.login('test@example.com', 'wrong-password'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(userRepo.findOneBy).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });
  });
});
