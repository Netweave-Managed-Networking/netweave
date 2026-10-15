import { ResourceRequirementCategory } from './resource-requirement-category.type';

/** requirements per category derived from a project description; categories without any are left out */
export type GeneratedRequirementsDTO = Partial<
  Record<ResourceRequirementCategory, string>
>;
