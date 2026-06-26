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
      'registerOrFail' | 'loginOrFail' | 'getAuthUserFromTokenOrFail',
      jest.Mock
    >
  >;

  beforeEach(async () => {
    authService = {
      registerOrFail: jest.fn().mockResolvedValue('register-token'),
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

  it('should set an HttpOnly cookie on register', async () => {
    const dto = { email: mockUserAuthDTO.user.email, password: 'password123' };
    const res = { cookie: jest.fn() } as unknown as Response;

    const result = await controller.register(dto, res);

    expect(authService.registerOrFail).toHaveBeenCalledWith(
      dto.email,
      dto.password,
    );
    expect(res.cookie).toHaveBeenCalledWith(
      'netweave_auth_token',
      'register-token',
      AuthService.COOKIE_CONSTS.options,
    );
    expect(result).toEqual(mockUserAuthDTO);
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
