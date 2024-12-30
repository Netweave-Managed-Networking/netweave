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
    staleTime: 20000,
  });
  return {
    ...organizations,
    organizations: organizations.data ?? [],
  };
}
