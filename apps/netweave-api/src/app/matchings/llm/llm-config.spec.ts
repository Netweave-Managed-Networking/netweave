import { createLanguageModel, readLlmConfig } from './llm-config';

describe('readLlmConfig', () => {
  it('returns null without LLM_PROVIDER, so the dummy matching is used', () => {
    expect(readLlmConfig({})).toBeNull();
    expect(readLlmConfig({ LLM_PROVIDER: ' ' })).toBeNull();
  });

  it('reads a complete configuration', () => {
    expect(
      readLlmConfig({
        LLM_PROVIDER: 'mistral',
        LLM_MODEL: 'mistral-small-latest',
        LLM_API_KEY: 'secret',
        LLM_CONCURRENCY: '10',
        LLM_TIMEOUT_MS: '30000',
        LLM_REASONING: 'none',
      }),
    ).toEqual({
      provider: 'mistral',
      model: 'mistral-small-latest',
      apiKey: 'secret',
      baseUrl: undefined,
      concurrency: 10,
      timeoutMs: 30000,
      reasoning: 'none',
    });
  });

  it('defaults concurrency, timeout and reasoning', () => {
    expect(
      readLlmConfig({ LLM_PROVIDER: 'openai', LLM_MODEL: 'gpt-x' }),
    ).toMatchObject({
      concurrency: 5,
      timeoutMs: 60000,
      reasoning: 'provider-default',
    });
  });

  it.each([
    [{ LLM_PROVIDER: 'skynet', LLM_MODEL: 'm' }, 'not supported'],
    [{ LLM_PROVIDER: 'openai' }, 'LLM_MODEL is required'],
    [
      { LLM_PROVIDER: 'openai-compatible', LLM_MODEL: 'm' },
      'LLM_BASE_URL is required',
    ],
    [
      { LLM_PROVIDER: 'openai', LLM_MODEL: 'm', LLM_CONCURRENCY: '0' },
      'positive integer',
    ],
    [
      { LLM_PROVIDER: 'openai', LLM_MODEL: 'm', LLM_TIMEOUT_MS: 'soon' },
      'positive integer',
    ],
    [
      { LLM_PROVIDER: 'openai', LLM_MODEL: 'm', LLM_REASONING: 'lots' },
      'LLM_REASONING "lots" is not supported',
    ],
  ])('rejects an invalid configuration %j', (env, message) => {
    expect(() => readLlmConfig(env)).toThrow(message);
  });
});

describe('createLanguageModel', () => {
  it.each(['openai', 'anthropic', 'mistral', 'openai-compatible'] as const)(
    'creates a %s model',
    (provider) => {
      const model = createLanguageModel({
        provider,
        model: 'some-model',
        apiKey: 'secret',
        baseUrl: 'http://localhost:11434/v1',
        concurrency: 1,
        timeoutMs: 1,
        reasoning: 'provider-default',
      });

      expect(model).toMatchObject({ modelId: 'some-model' });
    },
  );
});
