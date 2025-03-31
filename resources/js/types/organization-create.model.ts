import {
  ContactPersonCreate,
  emptyContactPerson,
} from './contact-person-create.model';
import { PickStringAsNumber } from './max-string-lengths.type';
import { OrganizationCategory } from './organization-category.model';
import {
  emptyOrganizationMin,
  OrganizationCreateMin,
  orgMinMax,
} from './organization-create-min.model';
import { OrganizationNotes } from './organization-notes.model';

export type OrganizationCreate = OrganizationCreateMin & {
  notes?: OrganizationNotes['notes'];
  organization_categories?: OrganizationCategory['id'][];
  organization_first_contact_person?: ContactPersonCreate;
};

export const emptyOrganization: OrganizationCreate = {
  ...emptyOrganizationMin,
  notes: '',
  organization_categories: [],
  organization_first_contact_person: emptyContactPerson,
};

/** these numbers are derived from the database limits */
export const orgMax: PickStringAsNumber<OrganizationCreate> = {
  ...orgMinMax,
  notes: 4095,
};

export type OrganizationCreateErrors = Partial<
  Record<keyof OrganizationCreate, string>
>;
