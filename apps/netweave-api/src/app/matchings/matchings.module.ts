import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { MembersModule } from '../members/members.module';
import { createLanguageModel, readLlmConfig } from './llm/llm-config';
import { LlmMatchingStrategy } from './llm-matching.strategy';
import { MatchingRun } from './matching-run.entity';
import { MATCHING_STRATEGY, MatchingStrategy } from './matching-strategy';
import { Matching } from './matching.entity';
import { MatchingsController } from './matchings.controller';
import { MatchingsService } from './matchings.service';
import { StringLengthMatchingStrategy } from './string-length-matching.strategy';

/** the llm matching if an LLM_PROVIDER is configured, otherwise the dummy algorithm (e.g. for local dev and e2e tests) */
const createMatchingStrategy = (): MatchingStrategy => {
  const logger = new Logger('MatchingStrategy');
  const config = readLlmConfig(process.env);
  if (!config) {
    logger.warn(
      'No LLM_PROVIDER configured, using the dummy string length matching',
    );
    return new StringLengthMatchingStrategy();
  }
  logger.log(
    `Using llm matching with ${config.provider}/${config.model} (${config.concurrency} parallel calls)`,
  );
  return new LlmMatchingStrategy(createLanguageModel(config), config);
};

@Module({
  imports: [
    TypeOrmModule.forFeature([Matching, MatchingRun]),
    MembersModule,
    AuthModule,
  ],
  controllers: [MatchingsController],
  providers: [
    MatchingsService,
    { provide: MATCHING_STRATEGY, useFactory: createMatchingStrategy },
  ],
})
export class MatchingsModule {}
