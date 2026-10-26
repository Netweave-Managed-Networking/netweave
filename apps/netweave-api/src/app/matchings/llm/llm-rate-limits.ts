import type { LlmProvider } from './llm-config';

export interface RateLimit {
  requests: number;
  intervalMs: number;
}

/**
 * Not more than `requests` llm calls per `intervalMs` and provider, null for no limit.
 * Set slightly below the limit of our account tier: 429s are retried, but each one pauses all calls.
 */
export const LLM_RATE_LIMITS: Record<LlmProvider, RateLimit | null> = {
  mistral: { requests: 90, intervalMs: 60_000 },
  openai: { requests: 450, intervalMs: 60_000 },
  anthropic: { requests: 45, intervalMs: 60_000 },
  'openai-compatible': null, // self hosted, e.g. ollama
};
