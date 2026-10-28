import { Test, TestingModule } from '@nestjs/testing';
import {
  LlmConfigDTO,
  LlmConfigUpdateDTO,
  UserAuthDTO,
  UserDTO,
} from '@netweave/api-types';
import { AdminGuard } from '../auth/admin.guard';
import { AuthGuard } from '../auth/auth.guard';
import { LlmConfigController } from './llm-config.controller';
import { LlmConfigService } from './llm-config.service';

const mockAuthUser: UserAuthDTO = {
  sub: 7,
  user: { id: 7, email: 'admin@example.de', role: 'admin' } as UserDTO,
};

const ownConfig: LlmConfigDTO = {
  source: 'own',
  own: {
    provider: 'openai',
    model: 'gpt-x',
    baseUrl: null,
    hasApiKey: true,
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  },
};

const dto: LlmConfigUpdateDTO = {
  provider: 'openai',
  model: 'gpt-x',
  apiKey: 'sk-new',
};

describe('LlmConfigController', () => {
  let controller: LlmConfigController;
  let llmConfigService: Record<'get' | 'update' | 'remove' | 'test', jest.Mock>;

  beforeEach(async () => {
    llmConfigService = {
      get: jest.fn().mockResolvedValue(ownConfig),
      update: jest.fn().mockResolvedValue(ownConfig),
      remove: jest.fn().mockResolvedValue({ source: 'netweave', own: null }),
      test: jest.fn().mockResolvedValue({ success: true, error: null }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LlmConfigController],
      providers: [{ provide: LlmConfigService, useValue: llmConfigService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get(LlmConfigController);
  });

  it('is restricted to admins', () => {
    expect(Reflect.getMetadata('__guards__', LlmConfigController)).toEqual([
      AuthGuard,
      AdminGuard,
    ]);
  });

  it('returns the config from the service', async () => {
    expect(await controller.get()).toEqual(ownConfig);
  });

  it('updates the config with the current user id', async () => {
    expect(await controller.update(mockAuthUser, dto)).toEqual(ownConfig);
    expect(llmConfigService.update).toHaveBeenCalledWith(dto, 7);
  });

  it('switches back to the netweave llm access', async () => {
    expect(await controller.remove(mockAuthUser)).toEqual({
      source: 'netweave',
      own: null,
    });
    expect(llmConfigService.remove).toHaveBeenCalledWith(7);
  });

  it('tests the given config', async () => {
    expect(await controller.test(dto)).toEqual({ success: true, error: null });
    expect(llmConfigService.test).toHaveBeenCalledWith(dto);
  });
});
