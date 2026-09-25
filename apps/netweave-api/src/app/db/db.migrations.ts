import { CreateOrganization1776427891713 } from './migrations/1776427891713-create-organization';
import { OrganizationsChangeName1778436499335 } from './migrations/1778436499335-organizations-change-name';
import { OrganizationsChangeName1778567667688 } from './migrations/1778567667688-organizations-change-name';
import { UsersCreate1780322559206 } from './migrations/1780322559206-users-create';
import { UsersAddRole1780767586491 } from './migrations/1780767586491-users-add-role';
import { UsersRenameTable1780949556090 } from './migrations/1780949556090-users-rename-table';
import { UsersFixesRoleNoDefaultSequenceRename1781288095192 } from './migrations/1781288095192-users-fixes-role-no-default-sequence-rename';
import { UserEmailWhitelistsCreate1781289531508 } from './migrations/1781289531508-user-email-whitelists-create';
import { UserEmailWhitelistsFixForeignKeyOnUser1781623307811 } from './migrations/1781623307811-user-email-whitelists-fix-foreign-key-on-user';
import { UserEmailWhitelistRenameCreatedByIdColumn1786635620919 } from './migrations/1786635620919-user-email-whitelist-rename-created-by-id-column';
import { OrganizationsRenameMember1789313978460 } from './migrations/1789313978460-organizations-rename-member';
import { InvitationsCreate1790057195000 } from './migrations/1790057195000-invitations-create';
import { MailConfigCreate1790200000000 } from './migrations/1790200000000-mail-config-create';
import { MembersAddInvitation1790300000000 } from './migrations/1790300000000-members-add-invitation';
import { MemberResourcesRequirementsCreate1790400000000 } from './migrations/1790400000000-member-resources-requirements-create';
import { UserEmailWhitelistsAddRole1790500000000 } from './migrations/1790500000000-user-email-whitelists-add-role';
import { MatchingsCreate1790600000000 } from './migrations/1790600000000-matchings-create';
import { MatchingRunsAddInputHash1790700000000 } from './migrations/1790700000000-matching-runs-add-input-hash';

export const Migrations = [
  CreateOrganization1776427891713,
  OrganizationsChangeName1778436499335,
  OrganizationsChangeName1778567667688,
  UsersCreate1780322559206,
  UsersAddRole1780767586491,
  UsersRenameTable1780949556090,
  UsersFixesRoleNoDefaultSequenceRename1781288095192,
  UserEmailWhitelistsCreate1781289531508,
  UserEmailWhitelistsFixForeignKeyOnUser1781623307811,
  UserEmailWhitelistRenameCreatedByIdColumn1786635620919,
  OrganizationsRenameMember1789313978460,
  InvitationsCreate1790057195000,
  MailConfigCreate1790200000000,
  MembersAddInvitation1790300000000,
  MemberResourcesRequirementsCreate1790400000000,
  UserEmailWhitelistsAddRole1790500000000,
  MatchingsCreate1790600000000,
  MatchingRunsAddInputHash1790700000000,
];
