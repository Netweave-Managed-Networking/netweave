import { CreateOrganization1776427891713 } from './migrations/1776427891713-create-organization';
import { OrganizationsChangeName1778436499335 } from './migrations/1778436499335-organizations-change-name';
import { OrganizationsChangeName1778567667688 } from './migrations/1778567667688-organizations-change-name';
import { UsersCreate1780322559206 } from './migrations/1780322559206-users-create';
import { UsersAddRole1780767586491 } from './migrations/1780767586491-users-add-role';
import { UsersRenameTable1780949556090 } from './migrations/1780949556090-users-rename-table';
import { UsersFixesRoleNoDefaultSequenceRename1781288095192 } from './migrations/1781288095192-users-fixes-role-no-default-sequence-rename';
import { UserEmailWhitelistsCreate1781289531508 } from './migrations/1781289531508-user-email-whitelists-create';
import { UserEmailWhitelistsFixForeignKeyOnUser1781623307811 } from './migrations/1781623307811-user-email-whitelists-fix-foreign-key-on-user';

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
];
