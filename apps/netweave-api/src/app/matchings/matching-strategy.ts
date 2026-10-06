import { MatchingDetailsDTO } from '@netweave/api-types';
import { Member } from '../members/member.entity';

export interface MatchingResult {
  score: number; // 0-100
  details: MatchingDetailsDTO | null;
}

/**
 * calculates how well the potential match fits the seeker; must not assume symmetry.
 * once `signal` is aborted (e.g. the run already failed), pending work should be dropped instead of finished.
 */
export interface MatchingStrategy {
  score(
    seeker: Member,
    potentialMatch: Member,
    signal?: AbortSignal,
  ): Promise<MatchingResult>;
}

export const MATCHING_STRATEGY = Symbol('MATCHING_STRATEGY');
