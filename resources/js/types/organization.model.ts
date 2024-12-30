import { IdName } from './id-name.model';
import { OrganizationMin } from './organization-min.model';

export interface Organization extends OrganizationMin {
  organization_categories: IdName[];
}
