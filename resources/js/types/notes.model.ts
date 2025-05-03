import { Organization } from './organization.model';

export interface Notes {
  id: string;
  notes: string | null; // TODO make them required
  organization_id: Organization['id'];
}
