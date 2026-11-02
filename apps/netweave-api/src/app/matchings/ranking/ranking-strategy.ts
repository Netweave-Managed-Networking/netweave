import { RankingWeightsDTO, RecommendationsDTO } from '@netweave/api-types';
import { Member } from '../../members/member.entity';
import { Matching } from '../matching.entity';
import {
  CategoryMatching,
  ProfileScores,
  RankingScore,
  RankingCandidate,
} from './category-matching';
import { CultureWeighting } from './culture-weighting';
import { MemberProfile, toMemberProfiles } from './member-profile';
import {
  viewOfEnvironmentSimilarity,
  viewOfNatureSimilarity,
} from './world-view-similarity';

export interface RankingInput {
  members: Pick<
    Member,
    'id' | 'cultureWeights' | 'viewOfEnvironmentAnswers' | 'viewOfNature'
  >[];
  matchings: Pick<
    Matching,
    'memberSeekerId' | 'memberPotentialMatchId' | 'details'
  >[];
}

export interface RankingStrategy {
  readonly name: string;
  rank(input: RankingInput): RecommendationsDTO;
}

export const RANKING_STRATEGY = Symbol('RANKING_STRATEGY');

export class ComposedRankingStrategy implements RankingStrategy {
  public constructor(
    public readonly name: string,
    private readonly categoryMatching: CategoryMatching,
    private readonly cultureWeighting: CultureWeighting,
    private readonly weights: RankingWeightsDTO,
  ) {}

  public rank({ members, matchings }: RankingInput): RecommendationsDTO {
    const profiles = toMemberProfiles(members);

    const candidatesBySeeker = new Map<number, RankingCandidate[]>();

    for (const matching of matchings) {
      const seekerId = matching.memberSeekerId;
      const potentialMatchId = matching.memberPotentialMatchId;

      const candidates = candidatesBySeeker.get(seekerId) ?? [];
      candidates.push({
        memberId: potentialMatchId,
        categories: matching.details?.categories ?? [],
        scores: this.profileScores(
          profiles.get(seekerId),
          profiles.get(potentialMatchId),
        ),
      });
      candidatesBySeeker.set(seekerId, candidates);
    }

    const recommendations = members.map(({ id }) =>
      this.categoryMatching.recommend(
        id,
        candidatesBySeeker.get(id) ?? [],
        this.rankingScore,
      ),
    );

    return {
      strategy: this.name,
      weights: this.weights,
      members: recommendations,
    };
  }

  private profileScores(
    seeker: MemberProfile | undefined,
    potentialMatch: MemberProfile | undefined,
  ): ProfileScores {
    return {
      cultureScore: scoreOfBoth(
        seeker?.culture,
        potentialMatch?.culture,
        (a, b) => this.cultureWeighting.score(a, b),
      ),
      viewOfEnvironmentScore: scoreOfBoth(
        seeker?.viewOfEnvironmentScore,
        potentialMatch?.viewOfEnvironmentScore,
        viewOfEnvironmentSimilarity,
      ),
      viewOfNatureScore: scoreOfBoth(
        seeker?.viewOfNature,
        potentialMatch?.viewOfNature,
        viewOfNatureSimilarity,
      ),
    };
  }

  // weighted average; a segment without a value (no culture or world view answers, nep not implemented yet) is
  // left out entirely, so it does not drag the score down as a 0 would
  private readonly rankingScore: RankingScore = (
    matchingScore,
    { cultureScore, viewOfEnvironmentScore, viewOfNatureScore },
  ) => {
    const segments = [
      { weight: this.weights.matching, score: matchingScore },
      { weight: this.weights.culture, score: cultureScore },
      { weight: this.weights.viewOfEnvironment, score: viewOfEnvironmentScore },
      { weight: this.weights.viewOfNature, score: viewOfNatureScore },
      { weight: this.weights.nep, score: null },
    ].filter(
      (segment): segment is { weight: number; score: number } =>
        segment.score !== null && segment.weight > 0,
    );

    const totalWeight = sum(segments.map(({ weight }) => weight));
    if (totalWeight === 0) return 0;

    const weightedScore = sum(
      segments.map(({ weight, score }) => weight * score),
    );

    return weightedScore / totalWeight;
  };
}

// compared with null, as a view of environment score of 0 is a valid answer
const scoreOfBoth = <T>(
  seeker: T | null | undefined,
  potentialMatch: T | null | undefined,
  score: (seeker: T, potentialMatch: T) => number,
): number | null =>
  seeker == null || potentialMatch == null
    ? null
    : score(seeker, potentialMatch);

const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0);
