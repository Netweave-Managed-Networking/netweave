import {
  CULTURE_ORIENTATIONS,
  CultureOrientation,
  parseCultureItemId,
} from '@netweave/api-types';
import { MemberCultureWeight } from '../../members/member-culture-weight.entity';

/** share of each orientation in percent, adding up to 100 */
export type CultureProfile = Record<CultureOrientation, number>;

/** the average share of each orientation over the answered topics; null without any culture answers */
export const toCultureProfile = (
  weights: Pick<MemberCultureWeight, 'itemId' | 'weight' | 'topicTotal'>[],
): CultureProfile | null => {
  const answeredTopics = new Set(
    weights.map(({ itemId }) => parseCultureItemId(itemId).topic),
  );
  if (answeredTopics.size === 0) return null;

  const profile: CultureProfile = { G: 0, I: 0, W: 0, S: 0 };

  for (const { itemId, weight, topicTotal } of weights) {
    const { orientation } = parseCultureItemId(itemId);
    const shareInTopic = (weight * 100) / topicTotal;

    profile[orientation] += shareInTopic / answeredTopics.size;
  }

  return profile;
};

/** the orientation with the highest share, which is the one with the highest sum over the topics Z1 to Z4; on a tie the first in CULTURE_ORIENTATIONS */
export const dominantOrientation = (
  profile: CultureProfile,
): CultureOrientation =>
  CULTURE_ORIENTATIONS.reduce((dominant, orientation) =>
    profile[orientation] > profile[dominant] ? orientation : dominant,
  );
