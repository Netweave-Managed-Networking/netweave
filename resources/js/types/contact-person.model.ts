import { IdName } from './id-name.model';
import { Organization } from './organization.model';

export interface ContactPerson extends IdName {
  email: string;
  phone: string;
  postcode_city: string;
  street_hnr: string;
  created_at: string;
  updated_at: string;
  organization_id: Organization['id'];
}
