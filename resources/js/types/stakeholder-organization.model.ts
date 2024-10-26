import { StakeholderCategoryMin } from './stakeholder-category-min.model';
import { StakeholderOrganizationMin } from './stakeholder-organization-min.model';

export interface StakeholderOrganization extends StakeholderOrganizationMin {
  stakeholder_categories: StakeholderCategoryMin[];
}
