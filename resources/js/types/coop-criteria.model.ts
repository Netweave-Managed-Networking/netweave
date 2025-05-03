import { Organization } from './organization.model';
import { Timestamps } from './timestamps.type';

export interface CoopCriteria extends Timestamps {
  id: number;
  for_coop: string | null;
  ko_no_coop: string | null;
  organization_id: Organization['id'];
}
