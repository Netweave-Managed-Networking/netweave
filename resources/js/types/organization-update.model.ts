import { Organization } from './organization.model';

export type OrganizationUpdate = Partial<
  Pick<
    Organization,
    'name' | 'email' | 'phone' | 'postcode_city' | 'street_hnr'
  >
>;
