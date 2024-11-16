import { Organization } from '@/types/organization.model';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchOrganizations } from '../axios/fetchOrganizations.axios';

type UseOrganizationsResult = Pick<
  UseQueryResult<Organization[], Error>,
  'isError' | 'isLoading'
> & { organizations: Organization[] };

export function useOrganizations(): UseOrganizationsResult {
  const organizations = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: () => fetchOrganizations(),
  });
  return {
    ...organizations,
    organizations: organizations.data ?? [],
  };
}
