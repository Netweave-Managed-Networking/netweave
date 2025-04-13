import { Organization } from './organization.model';

export interface Restriction {
  id: number;
  type: 'regional' | 'thematic';
  description: string;
  organization_id: Organization['id'];
}
