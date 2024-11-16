import { OrganizationCategoryMin } from './organization-category-min.model';
import { OrganizationMin } from './organization-min.model';

export interface Organization extends OrganizationMin {
  organization_categories: OrganizationCategoryMin[];
}
