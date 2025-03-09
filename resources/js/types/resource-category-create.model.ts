import { ResourceCategory } from './resource-category.model';

export type ResourceCategoryCreate = Pick<
  ResourceCategory,
  'title' | 'definition'
>;
