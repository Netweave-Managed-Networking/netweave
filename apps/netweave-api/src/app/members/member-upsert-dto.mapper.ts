import { MemberUpsertDTO } from '@netweave/api-types';
import { Member } from './member.entity';

export const toMemberUpsertDTO = (member: Member): MemberUpsertDTO => ({
  name: member.name,
  contact: member.contact,
  resourcesRequirements: (member.resourcesRequirements ?? []).map(
    ({ category, resources, requirements }) => ({
      category,
      resources,
      requirements,
    }),
  ),
});
