import {
  CULTURE_ORIENTATIONS,
  CULTURE_TOPICS,
  CultureTopic,
  GeneratedRequirementsDTO,
  InvitationTokenDTO,
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
  email: string;
  resourcesRequirements: ResourcesRequirementsModel;
  cultureWeights: CultureWeightsModel;
}

// form fields need strings, while the API uses null for empty values

export const toMemberFormModel = (
  invitation: InvitationTokenDTO | null,
): MemberFormModel => {
  const member = invitation?.member ?? null;
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
    // a pending email is shown as it was entered, so saving again does not cancel it
    email: invitation?.pendingEmail ?? invitation?.email ?? '',
    resourcesRequirements,
    cultureWeights,
  };
};

export const toMemberUpsertDTO = ({
  name,
  contact,
  email,
  resourcesRequirements,
  cultureWeights,
}: MemberFormModel): MemberUpsertDTO => ({
  name,
  contact: contact || null,
  email: email.trim(),
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

/** generated requirements are added below the existing ones, never replace them */
export const appendRequirements = (
  current: ResourcesRequirementsModel,
  generated: GeneratedRequirementsDTO,
): ResourcesRequirementsModel =>
  Object.fromEntries(
    RESOURCE_REQUIREMENT_CATEGORIES.map((category) => {
      const addition = generated[category]?.trim();
      if (!addition) return [category, current[category]];

      const existing = current[category].requirements.trim();
      return [
        category,
        {
          ...current[category],
          requirements: existing ? `${existing}\n${addition}` : addition,
        },
      ];
    }),
  ) as ResourcesRequirementsModel; // fromEntries loses the key type
