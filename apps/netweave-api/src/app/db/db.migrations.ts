import { CreateOrganization1776427891713 } from './migrations/1776427891713-create-organization';
import { OrganizationsChangeName1778436499335 } from './migrations/1778436499335-organizations-change-name';
import { OrganizationsChangeName1778567667688 } from './migrations/1778567667688-organizations-change-name';
import { UsersCreate1780322559206 } from './migrations/1780322559206-users-create';

export const Migrations = [
  CreateOrganization1776427891713,
  OrganizationsChangeName1778436499335,
  OrganizationsChangeName1778567667688,
  UsersCreate1780322559206,
];
