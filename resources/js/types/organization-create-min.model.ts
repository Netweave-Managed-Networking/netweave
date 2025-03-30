import { PickStringAsNumber } from './max-string-lengths.type';
import { Organization } from './organization.model';

export type OrganizationCreateMin = Partial<
  Pick<
    Organization,
    'name' | 'email' | 'phone' | 'postcode_city' | 'street_hnr'
  >
>;

export const emptyOrganizationMin: OrganizationCreateMin = {
  name: '',
  email: '',
  phone: '',
  postcode_city: '',
  street_hnr: '',
};

/** these numbers are derived from the database limits */
export const orgMinMax: PickStringAsNumber<OrganizationCreateMin> = {
  name: 127,
  email: 63,
  phone: 63,
  postcode_city: 63,
  street_hnr: 127,
};

export type OrganizationCreateMinErrors = Partial<
  Record<keyof OrganizationCreateMin, string>
>;
