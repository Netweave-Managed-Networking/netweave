export const RESOURCE_REQUIREMENT_CATEGORIES = [
  'competencies',
  'financial_resources',
  'premises',
  'land',
  'equipment',
  'networks',
  'helping_hands',
] as const;

export type ResourceRequirementCategory =
  (typeof RESOURCE_REQUIREMENT_CATEGORIES)[number];
