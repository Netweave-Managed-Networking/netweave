import { OrganizationCategory } from './organization-category.model';

export type OrganizationCategoryCreate = Pick<
  OrganizationCategory,
  'name' | 'description'
>;
