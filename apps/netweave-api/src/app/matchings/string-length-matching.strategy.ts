import { Injectable } from '@nestjs/common';
import { MatchingDetailsDTO } from '@netweave/api-types';
import { Member } from '../members/member.entity';
import { MatchingResult, MatchingStrategy } from './matching-strategy';

/**
 * dummy algorithm until the real matching exists:
 * per category, the closer the length of the target's resources is to the length of the source's requirements, the higher the score.
 * categories without a requirement of the source are ignored, the overall score is the average of the remaining ones.
 */
@Injectable()
export class StringLengthMatchingStrategy implements MatchingStrategy {
  public async score(source: Member, target: Member): Promise<MatchingResult> {
    const categories: MatchingDetailsDTO['categories'] = [];

    for (const { category, requirements } of source.resourcesRequirements ??
      []) {
      const requirementLength = requirements?.trim().length ?? 0;
      if (requirementLength === 0) continue; // nothing needed, nothing to match

      const resources = target.resourcesRequirements?.find(
        (rr) => rr.category === category,
      )?.resources;
      const resourceLength = resources?.trim().length ?? 0;

      categories.push({
        category,
        score: scoreByLength(requirementLength, resourceLength),
      });
    }

    const score =
      categories.length === 0
        ? 0
        : Math.round(
            categories.reduce((sum, c) => sum + c.score, 0) / categories.length,
          );

    return { score, details: { categories } };
  }
}

/** 100 for equal length, decreasing with the deviation relative to the requirement's length */
const scoreByLength = (requirementLength: number, resourceLength: number) => {
  if (resourceLength === 0) return 0;
  const deviation =
    Math.abs(requirementLength - resourceLength) / requirementLength;
  return Math.round(Math.max(0, 100 - 100 * deviation));
};
