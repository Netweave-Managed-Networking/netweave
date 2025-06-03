import { OrganizationCategoryWithOrgs } from '@/types/organization-category-with-orgs.model';
import axios from 'axios';

/** fetches the category of given id with ids & names of organizations it is attached to */
export async function fetchOrganizationCategory(categoryId: number): Promise<OrganizationCategoryWithOrgs> {
  const getCategoryRoute = route('organization-categories.api.get', categoryId);
  return (await axios.get(getCategoryRoute)).data;
}
