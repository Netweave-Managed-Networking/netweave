import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<Record<'register' | 'login', jest.Mock>>;

  beforeEach(async () => {
    authService = {
      register: jest.fn().mockResolvedValue({ access_token: 'register-token' }),
      login: jest.fn().mockResolvedValue({ access_token: 'login-token' }),
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

  it('should call authService.register for register', async () => {
    const dto = { email: 'test@example.com', password: 'password123' };

    const result = await controller.register(dto);

    expect(authService.register).toHaveBeenCalledWith(dto.email, dto.password);
    expect(result).toEqual({ access_token: 'register-token' });
  });

  it('should call authService.login for login', async () => {
    const dto = { email: 'test@example.com', password: 'password123' };

    const result = await controller.login(dto);

    expect(authService.login).toHaveBeenCalledWith(dto.email, dto.password);
    expect(result).toEqual({ access_token: 'login-token' });
  });
});
