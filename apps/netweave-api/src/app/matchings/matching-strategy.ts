import { MatchingDetailsDTO } from '@netweave/api-types';
import { Member } from '../members/member.entity';

export interface MatchingResult {
  score: number; // 0-100
  details: MatchingDetailsDTO | null;
}

/** calculates how well the target matches the source; must not assume symmetry */
export interface MatchingStrategy {
  score(source: Member, target: Member): Promise<MatchingResult>;
}

export const MATCHING_STRATEGY = Symbol('MATCHING_STRATEGY');
