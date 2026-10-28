import { MatchingDetailsDTO } from '@netweave/api-types';
import { Member } from '../members/member.entity';

export interface MatchingResult {
  score: number; // 0-100
  details: MatchingDetailsDTO | null;
}

/** unidirectional: how well the potential match fits the seeker */
export interface MatchingStrategy {
  score(
    seeker: Member,
    potentialMatch: Member,
    signal?: AbortSignal,
  ): Promise<MatchingResult>;
}

export interface MatchingStrategyResolver {
  forRun(): Promise<MatchingStrategy>;
}

export const MATCHING_STRATEGY_RESOLVER = Symbol('MATCHING_STRATEGY_RESOLVER');
