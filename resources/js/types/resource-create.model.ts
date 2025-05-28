import { PickStringAsNumber } from './max-string-lengths.type';
import { Organization } from './organization.model';
import { ResourceCategory } from './resource-category.model';
import { Resource } from './resource.model';

export type ResourceCreate = Partial<
  Pick<Resource, 'description' | 'summary'> & {
    type: Resource['type'] | null;
    organization_id: Organization['id'];
    resource_categories: ResourceCategory['id'][];
  }
>;

export const emptyResource: (organization_id: Organization['id']) => ResourceCreate = (organization_id) => ({
  type: null,
  description: '',
  summary: '',
  resource_categories: [],
  organization_id,
});

/** these numbers are derived from the database limits */
export const resourceMax: PickStringAsNumber<ResourceCreate> = {
  summary: 255,
  description: 8191,
  type: 15,
};
