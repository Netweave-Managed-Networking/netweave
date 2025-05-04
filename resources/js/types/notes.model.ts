import { Organization } from './organization.model';

export interface Notes {
  id: string;
  notes: string;
  organization_id: Organization['id'];
}
