import { Organization } from './organization.model';

export interface Resource {
  id: number;
  summary?: string;
  description: string;
  type: 'resource' | 'requirement';
  organization_id: Organization['id'];
}
