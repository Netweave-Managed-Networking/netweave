import { Injectable, Logger } from '@nestjs/common';
import { LlmConfigService } from '../llm-config/llm-config.service';
import {
  createLanguageModel,
  LlmConfig,
  readLlmConfig,
  readLlmTuning,
} from './llm/llm-config';
import { LLM_RATE_LIMITS } from './llm/llm-rate-limits';
import { LlmMatchingStrategy } from './llm-matching.strategy';
import {
  MatchingStrategy,
  MatchingStrategyResolver,
} from './matching-strategy';
import { StringLengthMatchingStrategy } from './string-length-matching.strategy';

@Injectable()
export class LlmMatchingStrategyResolver implements MatchingStrategyResolver {
  private readonly logger = new Logger('MatchingStrategy');
  private readonly netweaveConfig = readLlmConfig(process.env);
  private readonly tuning = readLlmTuning(process.env);

  public constructor(private readonly llmConfigService: LlmConfigService) {}

  public async forRun(): Promise<MatchingStrategy> {
    const ownAccess = await this.llmConfigService.getOwnAccess();
    const config: LlmConfig | null = ownAccess
      ? {
          ...ownAccess,
          ...this.tuning,
          reasoning: 'provider-default',
          rateLimit: LLM_RATE_LIMITS[ownAccess.provider],
        }
      : this.netweaveConfig;

    if (!config) {
      this.logger.warn(
        'No LLM_PROVIDER configured, using the dummy string length matching',
      );
      return new StringLengthMatchingStrategy();
    }
    const rateLimit = config.rateLimit
      ? `, at most ${config.rateLimit.requests} per ${config.rateLimit.intervalMs / 1000}s`
      : '';
    this.logger.log(
      `Using llm matching with the ${ownAccess ? 'own' : 'netweave'} llm access ` +
        `${config.provider}/${config.model} (${config.concurrency} parallel calls${rateLimit})`,
    );
    return new LlmMatchingStrategy(createLanguageModel(config), config);
  }
}
