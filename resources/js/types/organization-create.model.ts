import { PickStringAsNumber } from './max-string-lengths.type';
import { OrganizationCategory } from './organization-category.model';
import { Organization } from './organization.model';

export type OrganizationCreate = Partial<
  Pick<
    Organization,
    'name' | 'email' | 'phone' | 'postcode_city' | 'street_hnr'
  > & { organization_categories: OrganizationCategory['id'][] }
>;

export const emptyOrganization: OrganizationCreate = {
  name: '',
  email: '',
  phone: '',
  postcode_city: '',
  street_hnr: '',
  organization_categories: [],
};

/** these numbers are derived from the database limits */
export const orgMax: PickStringAsNumber<OrganizationCreate> = {
  name: 127,
  email: 63,
  phone: 63,
  postcode_city: 63,
  street_hnr: 127,
};
