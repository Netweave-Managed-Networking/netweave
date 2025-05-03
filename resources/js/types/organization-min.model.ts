import { IdName } from './id-name.model';
import { Timestamps } from './timestamps.type';

/** organization min without related models */
export interface OrganizationMin extends IdName, Timestamps {
  email: string | null;
  phone: string | null;
  postcode_city: string | null;
  street_hnr: string | null;
}
