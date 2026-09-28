import { MatchingDetailsDTO } from '@netweave/api-types';
import { Member } from '../members/member.entity';

export interface MatchingResult {
  score: number; // 0-100
  details: MatchingDetailsDTO | null;
}

/** calculates how well the potential match fits the seeker; must not assume symmetry */
export interface MatchingStrategy {
  score(seeker: Member, potentialMatch: Member): Promise<MatchingResult>;
}

export const MATCHING_STRATEGY = Symbol('MATCHING_STRATEGY');
