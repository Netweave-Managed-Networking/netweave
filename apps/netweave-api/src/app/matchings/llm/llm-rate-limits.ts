import type { LlmProvider } from './llm-config';

export interface RateLimit {
  requests: number;
  intervalMs: number;
}

/**
 * Not more than `requests` llm calls per `intervalMs` and provider, null for no limit.
 * Set slightly below the requests limit of the lowest paid tier: 429s are retried, but each one pauses all calls.
 * The actual limits depend on the tier of the account and are shown in the provider's console.
 * Last checked: 2026-10-28
 */
export const LLM_RATE_LIMITS: Record<LlmProvider, RateLimit | null> = {
  // no numbers in the docs, the limits are only shown in the admin panel (Admin Panel › API › Limits)
  // and in the response headers. Free mode allows 1 request per second.
  // https://docs.mistral.ai/admin/billing-usage/usage-limits
  mistral: { requests: 90, intervalMs: 60_000 },
  // Build tier: 5,000 RPM
  // https://developers.openai.com/api/docs/guides/rate-limits
  openai: { requests: 4_500, intervalMs: 60_000 },
  // Start tier: 1,000 RPM for all current models
  // https://platform.claude.com/docs/en/api/rate-limits
  anthropic: { requests: 900, intervalMs: 60_000 },
  'openai-compatible': null, // self hosted, e.g. ollama
};
