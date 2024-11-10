import { StakeholderCategory } from './stakeholder-category.model';

export type StakeholderCategoryCreate = Pick<
  StakeholderCategory,
  'name' | 'description'
>;
