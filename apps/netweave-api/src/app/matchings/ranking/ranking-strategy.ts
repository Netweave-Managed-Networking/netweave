import { RankingWeightsDTO, RecommendationsDTO } from '@netweave/api-types';
import { Member } from '../../members/member.entity';
import { Matching } from '../matching.entity';
import {
  CategoryMatching,
  OverallScore,
  RankingCandidate,
} from './category-matching';
import { CultureProfile, toCultureProfile } from './culture-profile';
import { CultureWeighting } from './culture-weighting';

export interface RankingInput {
  members: Pick<Member, 'id' | 'cultureWeights'>[];
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
    const profiles = new Map(
      members.map(({ id, cultureWeights }) => [
        id,
        toCultureProfile(cultureWeights ?? []),
      ]),
    );

    const candidatesBySeeker = new Map<number, RankingCandidate[]>();

    for (const matching of matchings) {
      const seekerId = matching.memberSeekerId;
      const potentialMatchId = matching.memberPotentialMatchId;

      const candidates = candidatesBySeeker.get(seekerId) ?? [];
      candidates.push({
        memberId: potentialMatchId,
        categories: matching.details?.categories ?? [],
        cultureScore: this.cultureScore(
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
        this.overallScore,
      ),
    );

    return {
      strategy: this.name,
      weights: this.weights,
      members: recommendations,
    };
  }

  private cultureScore(
    seeker: CultureProfile | null | undefined,
    potentialMatch: CultureProfile | null | undefined,
  ): number | null {
    if (!seeker || !potentialMatch) return null;

    return this.cultureWeighting.score(seeker, potentialMatch);
  }

  // weighted average; a segment without a value (no culture answers, nep not implemented yet) is left out
  // entirely, so it does not drag the score down as a 0 would
  private readonly overallScore: OverallScore = (
    matchingScore,
    cultureScore,
  ) => {
    const segments = [
      { weight: this.weights.matching, score: matchingScore },
      { weight: this.weights.culture, score: cultureScore },
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

const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0);
