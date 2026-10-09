import {
  CULTURE_ORIENTATIONS,
  CULTURE_TOPICS,
  CultureTopic,
  MemberUpsertDTO,
  parseCultureItemId,
  RESOURCE_REQUIREMENT_CATEGORIES,
  ResourceRequirementCategory,
  toCultureItemId,
} from '@netweave/api-types';
import { PriorityWeights } from '../priority-ranker/priority-ranker.layout';

export type ResourcesRequirementsModel = Record<
  ResourceRequirementCategory,
  { resources: string; requirements: string }
>;

/** null while unanswered */
export type CultureWeightsModel = Record<CultureTopic, PriorityWeights | null>;

export interface MemberFormModel {
  name: string;
  contact: string;
  resourcesRequirements: ResourcesRequirementsModel;
  cultureWeights: CultureWeightsModel;
}

// form fields need strings, while the API uses null for empty values

export const toMemberFormModel = (
  member: MemberUpsertDTO | null,
): MemberFormModel => {
  const saved = new Map(
    member?.resourcesRequirements.map((item) => [item.category, item]),
  );

  const resourcesRequirements = Object.fromEntries(
    RESOURCE_REQUIREMENT_CATEGORIES.map((category) => [
      category,
      {
        resources: saved.get(category)?.resources ?? '',
        requirements: saved.get(category)?.requirements ?? '',
      },
    ]),
  ) as ResourcesRequirementsModel; // fromEntries loses the key type

  const savedWeights = (member?.cultureWeights ?? []).map(
    ({ itemId, weight }) => ({ ...parseCultureItemId(itemId), weight }),
  );

  const topicWeights = (topic: CultureTopic): PriorityWeights | null => {
    const saved = savedWeights.filter((item) => item.topic === topic);
    if (saved.length === 0) return null;

    return Object.fromEntries(
      saved.map(({ orientation, weight }) => [orientation, weight]),
    );
  };

  const cultureWeights = Object.fromEntries(
    CULTURE_TOPICS.map((topic) => [topic, topicWeights(topic)]),
  ) as CultureWeightsModel; // fromEntries loses the key type

  return {
    name: member?.name ?? '',
    contact: member?.contact ?? '',
    resourcesRequirements,
    cultureWeights,
  };
};

export const toMemberUpsertDTO = ({
  name,
  contact,
  resourcesRequirements,
  cultureWeights,
}: MemberFormModel): MemberUpsertDTO => ({
  name,
  contact: contact || null,
  resourcesRequirements: RESOURCE_REQUIREMENT_CATEGORIES.map((category) => ({
    category,
    resources: resourcesRequirements[category].resources || null,
    requirements: resourcesRequirements[category].requirements || null,
  })),
  // unanswered topics are left out, so their stored weights are kept
  cultureWeights: CULTURE_TOPICS.flatMap((topic) => {
    const weights = cultureWeights[topic];
    if (!weights) return [];

    return CULTURE_ORIENTATIONS.map((orientation) => ({
      itemId: toCultureItemId(topic, orientation),
      weight: weights[orientation],
    }));
  }),
});
