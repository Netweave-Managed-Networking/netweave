import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { MembersModule } from '../members/members.module';
import { MatchingRun } from './matching-run.entity';
import { MATCHING_STRATEGY } from './matching-strategy';
import { Matching } from './matching.entity';
import { MatchingsController } from './matchings.controller';
import { MatchingsService } from './matchings.service';
import { StringLengthMatchingStrategy } from './string-length-matching.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Matching, MatchingRun]),
    MembersModule,
    AuthModule,
  ],
  controllers: [MatchingsController],
  providers: [
    MatchingsService,
    { provide: MATCHING_STRATEGY, useClass: StringLengthMatchingStrategy },
  ],
})
export class MatchingsModule {}
