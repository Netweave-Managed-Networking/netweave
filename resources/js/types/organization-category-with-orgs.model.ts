import { IdName } from './id-name.model';
import { OrganizationCategory } from './organization-category.model';

export interface OrganizationCategoryWithOrgs extends OrganizationCategory {
  organizations: IdName[];
}
