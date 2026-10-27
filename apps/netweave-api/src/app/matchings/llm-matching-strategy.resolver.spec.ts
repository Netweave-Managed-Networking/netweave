import { Logger } from '@nestjs/common';
import { LlmConfigService } from '../llm-config/llm-config.service';
import * as llmConfig from './llm/llm-config';
import { LlmMatchingStrategyResolver } from './llm-matching-strategy.resolver';
import { LlmMatchingStrategy } from './llm-matching.strategy';
import { StringLengthMatchingStrategy } from './string-length-matching.strategy';

describe('LlmMatchingStrategyResolver', () => {
  const originalEnv = process.env;
  let llmConfigService: jest.Mocked<Pick<LlmConfigService, 'getOwnAccess'>>;
  let createModel: jest.SpyInstance;

  const resolver = () =>
    new LlmMatchingStrategyResolver(
      llmConfigService as unknown as LlmConfigService,
    );

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.LLM_PROVIDER;
    llmConfigService = { getOwnAccess: jest.fn().mockResolvedValue(null) };
    createModel = jest.spyOn(llmConfig, 'createLanguageModel');
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('uses the dummy matching without any llm access', async () => {
    expect(await resolver().forRun()).toBeInstanceOf(
      StringLengthMatchingStrategy,
    );
  });

  it('uses the netweave llm access from the env vars without an own one', async () => {
    Object.assign(process.env, {
      LLM_PROVIDER: 'mistral',
      LLM_MODEL: 'mistral-small-latest',
      LLM_API_KEY: 'netweave-key',
      LLM_BASE_URL: 'https://netweave-proxy.example.com',
    });

    expect(await resolver().forRun()).toBeInstanceOf(LlmMatchingStrategy);
    expect(createModel).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'mistral',
        model: 'mistral-small-latest',
        apiKey: 'netweave-key',
        baseUrl: 'https://netweave-proxy.example.com',
      }),
    );
  });

  it('prefers the own llm access, without mixing in any of the netweave access', async () => {
    Object.assign(process.env, {
      LLM_PROVIDER: 'mistral',
      LLM_MODEL: 'mistral-small-latest',
      LLM_API_KEY: 'netweave-key',
      LLM_BASE_URL: 'https://netweave-proxy.example.com',
      LLM_REASONING: 'high',
    });
    llmConfigService.getOwnAccess.mockResolvedValue({
      provider: 'openai',
      model: 'gpt-own',
      apiKey: 'own-key',
      baseUrl: undefined,
    });

    expect(await resolver().forRun()).toBeInstanceOf(LlmMatchingStrategy);
    expect(createModel).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'openai',
        model: 'gpt-own',
        apiKey: 'own-key',
        baseUrl: undefined,
        reasoning: 'provider-default',
      }),
    );
  });

  it('resolves per run, so a changed llm access applies without a restart', async () => {
    const instance = resolver();
    await instance.forRun();
    llmConfigService.getOwnAccess.mockResolvedValue({
      provider: 'anthropic',
      model: 'claude-x',
      apiKey: 'own-key',
      baseUrl: undefined,
    });

    expect(await instance.forRun()).toBeInstanceOf(LlmMatchingStrategy);
    expect(llmConfigService.getOwnAccess).toHaveBeenCalledTimes(2);
  });

  it('fails instead of falling back to the netweave access when the own one is unusable', async () => {
    Object.assign(process.env, { LLM_PROVIDER: 'openai', LLM_MODEL: 'gpt-x' });
    llmConfigService.getOwnAccess.mockRejectedValue(
      new Error('Unsupported state or unable to authenticate data'),
    );

    await expect(resolver().forRun()).rejects.toThrow();
    expect(createModel).not.toHaveBeenCalled();
  });

  it('fails on startup with an invalid env config', () => {
    process.env.LLM_PROVIDER = 'unknown';

    expect(resolver).toThrow(/LLM_PROVIDER/);
  });
});
