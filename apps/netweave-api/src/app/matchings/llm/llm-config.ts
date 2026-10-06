import { createAnthropic } from '@ai-sdk/anthropic';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { LanguageModel } from 'ai';

export const LLM_PROVIDERS = [
  'openai',
  'anthropic',
  'mistral',
  'openai-compatible', // e.g. ollama, vllm
] as const;

export type LlmProvider = (typeof LLM_PROVIDERS)[number];

export const LLM_REASONING_LEVELS = [
  'provider-default',
  'none',
  'minimal',
  'low',
  'medium',
  'high',
  'xhigh',
] as const;

export type LlmReasoning = (typeof LLM_REASONING_LEVELS)[number];

export interface LlmConfig {
  provider: LlmProvider;
  model: string;
  apiKey: string | undefined;
  baseUrl: string | undefined; // required for openai-compatible
  concurrency: number;
  timeoutMs: number; // per call
  reasoning: LlmReasoning;
}

const DEFAULT_CONCURRENCY = 5;
const DEFAULT_TIMEOUT_MS = 60_000;

/** null if LLM_PROVIDER is unset; throws on invalid config */
export const readLlmConfig = (env: NodeJS.ProcessEnv): LlmConfig | null => {
  const provider = env['LLM_PROVIDER']?.trim();
  if (!provider) return null;

  if (!LLM_PROVIDERS.includes(provider as LlmProvider)) {
    throw new Error(
      `LLM_PROVIDER "${provider}" is not supported, use one of: ${LLM_PROVIDERS.join(', ')}`,
    );
  }
  const model = env['LLM_MODEL']?.trim();
  if (!model) throw new Error('LLM_MODEL is required when LLM_PROVIDER is set');
  const baseUrl = env['LLM_BASE_URL']?.trim() || undefined;
  if (provider === 'openai-compatible' && !baseUrl) {
    throw new Error(
      'LLM_BASE_URL is required for LLM_PROVIDER openai-compatible',
    );
  }
  const reasoning = env['LLM_REASONING']?.trim() || 'provider-default';
  if (!LLM_REASONING_LEVELS.includes(reasoning as LlmReasoning)) {
    throw new Error(
      `LLM_REASONING "${reasoning}" is not supported, use one of: ${LLM_REASONING_LEVELS.join(', ')}`,
    );
  }

  return {
    provider: provider as LlmProvider,
    model,
    apiKey: env['LLM_API_KEY']?.trim() || undefined,
    baseUrl,
    concurrency: positiveInt(env, 'LLM_CONCURRENCY', DEFAULT_CONCURRENCY),
    timeoutMs: positiveInt(env, 'LLM_TIMEOUT_MS', DEFAULT_TIMEOUT_MS),
    reasoning: reasoning as LlmReasoning,
  };
};

export const createLanguageModel = ({
  provider,
  model,
  apiKey,
  baseUrl,
}: LlmConfig): LanguageModel => {
  switch (provider) {
    case 'openai':
      return createOpenAI({ apiKey, baseURL: baseUrl })(model);
    case 'anthropic':
      return createAnthropic({ apiKey, baseURL: baseUrl })(model);
    case 'mistral':
      return createMistral({ apiKey, baseURL: baseUrl })(model);
    case 'openai-compatible':
      return createOpenAICompatible({
        name: 'openai-compatible',
        apiKey,
        baseURL: baseUrl as string,
      })(model);
  }
};

const positiveInt = (
  env: NodeJS.ProcessEnv,
  name: string,
  fallback: number,
): number => {
  const raw = env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer, got "${raw}"`);
  }
  return value;
};
