import { Organization } from './organization.model';

export interface Notes {
  notes: string;
  organization_id: Organization['id'];
}
