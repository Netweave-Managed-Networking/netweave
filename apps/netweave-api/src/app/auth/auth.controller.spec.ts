import { Test, TestingModule } from '@nestjs/testing';
import { UserAuthDTO } from '@netweave/api-types';
import { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockUserAuthDTO: UserAuthDTO = {
  sub: 1,
  user: { email: 'test@example.de', role: 'editor' },
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<
    Record<'register' | 'login' | 'getAuthenticatedUser', jest.Mock>
  >;

  beforeEach(async () => {
    authService = {
      register: jest.fn().mockResolvedValue({ access_token: 'register-token' }),
      login: jest.fn().mockResolvedValue({ access_token: 'login-token' }),
      getAuthenticatedUser: jest.fn().mockReturnValue(mockUserAuthDTO),
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

    expect(authService.register).toHaveBeenCalledWith(dto.email, dto.password);
    expect(res.cookie).toHaveBeenCalledWith(
      'netweave_auth_token',
      'register-token',
      expect.objectContaining({
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
      }),
    );
    expect(result).toEqual(mockUserAuthDTO);
  });

  it('should set an HttpOnly cookie on login', async () => {
    const dto = { email: mockUserAuthDTO.user.email, password: 'password123' };
    const res = { cookie: jest.fn() } as unknown as Response;

    const result = await controller.login(dto, res);

    expect(authService.login).toHaveBeenCalledWith(dto.email, dto.password);
    expect(res.cookie).toHaveBeenCalledWith(
      'netweave_auth_token',
      'login-token',
      expect.objectContaining({
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
      }),
    );
    expect(result).toEqual(mockUserAuthDTO);
  });

  it('should clear the auth cookie on logout', () => {
    const res = { clearCookie: jest.fn() } as unknown as Response;

    const result = controller.logout(res);

    expect(res.clearCookie).toHaveBeenCalledWith('netweave_auth_token', {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    expect(result).toEqual({ success: true });
  });

  it('should verify the session from the auth cookie on me', async () => {
    const req = {
      headers: { cookie: 'netweave_auth_token=test-token' },
    } as unknown as Request;

    const result = await controller.me(req);

    expect(authService.getAuthenticatedUser).toHaveBeenCalledWith('test-token');
    expect(result).toEqual(mockUserAuthDTO);
  });
});
