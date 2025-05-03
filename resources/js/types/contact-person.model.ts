import { IdName } from './id-name.model';
import { Organization } from './organization.model';
import { Timestamps } from './timestamps.type';

export interface ContactPerson extends IdName, Timestamps {
  email: string | null;
  phone: string | null;
  postcode_city: string | null;
  street_hnr: string | null;
  organization_id: Organization['id'];
}
