import { Test, TestingModule } from '@nestjs/testing';
import { UserAuthDTO, UserDTO } from '@netweave/api-types';
import { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockUserAuthDTO: UserAuthDTO = {
  sub: 1,
  user: { email: 'test@example.de', role: 'editor' } as UserDTO,
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<
    Record<
      | 'registerOrFail'
      | 'loginOrFail'
      | 'verifyEmailOrFail'
      | 'resendVerificationMailOrFail'
      | 'getAuthUserFromTokenOrFail',
      jest.Mock
    >
  >;

  beforeEach(async () => {
    authService = {
      registerOrFail: jest.fn().mockResolvedValue(undefined),
      verifyEmailOrFail: jest.fn().mockResolvedValue('verify-token'),
      resendVerificationMailOrFail: jest.fn().mockResolvedValue(undefined),
      loginOrFail: jest.fn().mockResolvedValue('login-token'),
      getAuthUserFromTokenOrFail: jest.fn().mockReturnValue(mockUserAuthDTO),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('registers without logging in and returns the email the confirmation went to', async () => {
    const dto = { email: mockUserAuthDTO.user.email, password: 'password123' };

    const result = await controller.register(dto);

    expect(authService.registerOrFail).toHaveBeenCalledWith(
      dto.email,
      dto.password,
    );
    expect(result).toEqual({ email: dto.email });
  });

  it('should set an HttpOnly cookie on email verification', async () => {
    const res = { cookie: jest.fn() } as unknown as Response;

    const result = await controller.verifyEmail({ token: 'abc' }, res);

    expect(authService.verifyEmailOrFail).toHaveBeenCalledWith('abc');
    expect(res.cookie).toHaveBeenCalledWith(
      'netweave_auth_token',
      'verify-token',
      AuthService.COOKIE_CONSTS.options,
    );
    expect(result).toEqual(mockUserAuthDTO);
  });

  it('resends the confirmation mail', async () => {
    const result = await controller.resendVerificationMail({
      email: 'nb@example.com',
    });

    expect(authService.resendVerificationMailOrFail).toHaveBeenCalledWith(
      'nb@example.com',
    );
    expect(result).toEqual({ success: true });
  });

  it('should set an HttpOnly cookie on login', async () => {
    const dto = { email: mockUserAuthDTO.user.email, password: 'password123' };
    const res = { cookie: jest.fn() } as unknown as Response;

    const result = await controller.login(dto, res);

    expect(authService.loginOrFail).toHaveBeenCalledWith(
      dto.email,
      dto.password,
    );
    expect(res.cookie).toHaveBeenCalledWith(
      'netweave_auth_token',
      'login-token',
      AuthService.COOKIE_CONSTS.options,
    );
    expect(result).toEqual(mockUserAuthDTO);
  });

  it('should clear the auth cookie on logout', () => {
    const res = { clearCookie: jest.fn() } as unknown as Response;

    const result = controller.logout(res);

    expect(res.clearCookie).toHaveBeenCalledWith(
      'netweave_auth_token',
      AuthService.COOKIE_CONSTS.options,
    );
    expect(result).toEqual({ success: true });
  });

  describe('me', () => {
    it('returns the user injected by the @Me() decorator', () => {
      const mockUser = { sub: 1, user: {} as UserDTO };
      const result = controller.me(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('returns the same reference, performing no transformation', () => {
      const mockUser = { sub: 1, user: {} as UserDTO };
      const result = controller.me(mockUser);
      expect(result).toBe(mockUser);
    });
  });
});
