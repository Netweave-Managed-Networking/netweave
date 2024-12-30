import { Organization } from '@/types/organization.model';
import axios from 'axios';

export async function fetchOrganizations(): Promise<Organization[]> {
  return (await axios.get(route('organizations.api.index'))).data;
}
