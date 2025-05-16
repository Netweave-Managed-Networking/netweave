import { PickStringAsNumber } from './max-string-lengths.type';
import { OrganizationCategory } from './organization-category.model';

export type OrganizationCategoryCreate = Pick<OrganizationCategory, 'name' | 'description'>;

export const emptyOrganizationCategory: OrganizationCategoryCreate = {
  name: '',
  description: null,
};

/** these numbers are derived from the database limits */
export const orgCatMax: PickStringAsNumber<OrganizationCategoryCreate> = {
  name: 63,
  description: 255,
};
