import { StakeholderOrganization } from '@/types/stakeholder-organization.model';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchStakeholderOrganizations } from '../axios/fetchStakeholderOrganizations.axios';

type UseStakeholderOrganizationsResult = Pick<
  UseQueryResult<StakeholderOrganization[], Error>,
  'isError' | 'isLoading'
> & { stakeholderOrganizations: StakeholderOrganization[] };

export function useStakeholderOrganizations(): UseStakeholderOrganizationsResult {
  const stakeholderOrganizations = useQuery<StakeholderOrganization[]>({
    queryKey: ['stakeholder-organizations'],
    queryFn: () => fetchStakeholderOrganizations(),
  });
  return {
    ...stakeholderOrganizations,
    stakeholderOrganizations: stakeholderOrganizations.data ?? [],
  };
}
