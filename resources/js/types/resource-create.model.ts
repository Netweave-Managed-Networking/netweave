import { Resource } from './resource.model';

export type ResourceCreate = Partial<
  Pick<Resource, 'description' | 'summary'> & {
    type: Resource['type'] | null;
    organization_id: number;
    resource_categories: number[];
  }
>;
