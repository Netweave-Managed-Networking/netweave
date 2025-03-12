import { PickStringAsNumber } from './max-string-lengths.type';
import { ResourceCategory } from './resource-category.model';

export type ResourceCategoryCreate = Pick<
  ResourceCategory,
  'title' | 'definition'
>;

export const emptyOrganizationCategory: ResourceCategoryCreate = {
  title: '',
};

/** these numbers are derived from the database limits */
export const resCatMax: PickStringAsNumber<ResourceCategoryCreate> = {
  title: 63,
  definition: 1023,
};
