export const LLM_PROVIDERS = [
  'openai',
  'anthropic',
  'mistral',
  'openai-compatible', // e.g. ollama, vllm
] as const;

export type LlmProvider = (typeof LLM_PROVIDERS)[number];
