import { IdName } from './id-name.model';
import { Timestamps } from './timestamps.type';

export interface OrganizationCategory extends IdName, Timestamps {
  description: string | null;
}
