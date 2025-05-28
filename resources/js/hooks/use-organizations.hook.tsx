import { OrganizationLi } from '@/types/organization-li.model';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchOrganizations } from '../axios/fetch-organizations.axios';

type UseOrganizationsResult = Pick<UseQueryResult<OrganizationLi[], Error>, 'isError' | 'isLoading'> & { organizations: OrganizationLi[] };

export function useOrganizations(): UseOrganizationsResult {
  const organizations = useQuery<OrganizationLi[]>({
    queryKey: ['organizations'],
    queryFn: () => fetchOrganizations(),
    staleTime: 20000,
  });
  return {
    ...organizations,
    organizations: organizations.data ?? [],
  };
}
