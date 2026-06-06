import { CreateOrganization1776427891713 } from './migrations/1776427891713-create-organization';
import { OrganizationsChangeName1778436499335 } from './migrations/1778436499335-organizations-change-name';
import { OrganizationsChangeName1778567667688 } from './migrations/1778567667688-organizations-change-name';
import { UsersCreate1780322559206 } from './migrations/1780322559206-users-create';
import { UsersAddRole1780767586491 } from './migrations/1780767586491-users-add-role';

export const Migrations = [
  CreateOrganization1776427891713,
  OrganizationsChangeName1778436499335,
  OrganizationsChangeName1778567667688,
  UsersCreate1780322559206,
  UsersAddRole1780767586491,
];
