import { Organization } from './organization.model';

export interface CoopCriteria {
  id: number;
  for_coop: string;
  ko_no_coop: string;
  organization_id: Organization['id'];
}
