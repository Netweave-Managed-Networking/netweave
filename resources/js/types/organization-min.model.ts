import { IdName } from './id-name.model';

/** organization min without related models */
export interface OrganizationMin extends IdName {
  email: string;
  phone: string;
  postcode_city: string;
  street_hnr: string;
  created_at: string;
  updated_at: string;
}
