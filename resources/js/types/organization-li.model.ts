import { IdName } from './id-name.model';
import { OrganizationMin } from './organization-min.model';

/** organization list item which is given by OrganizationController @ index */
export interface OrganizationLi extends OrganizationMin {
  organization_categories: IdName[];
}
