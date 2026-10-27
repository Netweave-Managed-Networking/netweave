import { LlmProvider } from './llm-provider.type';

export type LlmConfigSource = 'netweave' | 'own';

export interface OwnLlmConfigDTO {
  provider: LlmProvider;
  model: string;
  baseUrl: string | null;
  hasApiKey: boolean;
  updatedAt: Date;
}

export interface LlmConfigDTO {
  source: LlmConfigSource;
  own: OwnLlmConfigDTO | null;
}
