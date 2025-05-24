import { OrganizationLi } from '@/types/organization-li.model';
import axios from 'axios';

export async function fetchOrganizations(): Promise<OrganizationLi[]> {
  return (await axios.get(route('organizations.api.index'))).data;
}
