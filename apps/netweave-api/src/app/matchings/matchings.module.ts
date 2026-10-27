import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { LlmConfigModule } from '../llm-config/llm-config.module';
import { MailModule } from '../mail/mail.module';
import { MembersModule } from '../members/members.module';
import { LlmMatchingStrategyResolver } from './llm-matching-strategy.resolver';
import { MatchingRun } from './matching-run.entity';
import { MATCHING_STRATEGY_RESOLVER } from './matching-strategy';
import { Matching } from './matching.entity';
import { MatchingsController } from './matchings.controller';
import { MatchingsService } from './matchings.service';
import { createRankingStrategy } from './ranking/ranking-strategies';
import { RANKING_STRATEGY } from './ranking/ranking-strategy';
import { RecommendationMailsService } from './recommendation-mails/recommendation-mails.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Matching, MatchingRun]),
    MembersModule,
    AuthModule,
    MailModule,
    LlmConfigModule,
  ],
  controllers: [MatchingsController],
  providers: [
    MatchingsService,
    RecommendationMailsService,
    {
      provide: MATCHING_STRATEGY_RESOLVER,
      useClass: LlmMatchingStrategyResolver,
    },
    { provide: RANKING_STRATEGY, useFactory: () => createRankingStrategy() },
  ],
})
export class MatchingsModule {}
