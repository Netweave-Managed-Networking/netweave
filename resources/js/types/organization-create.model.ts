import {
  ContactPersonCreate,
  emptyContactPerson,
} from './contact-person-create.model';
import { emptyNotes, NotesCreate } from './notes-create.model';
import { OrganizationCategory } from './organization-category.model';
import {
  emptyOrganizationMin,
  OrganizationCreateMin,
} from './organization-create-min.model';

export type OrganizationCreate = OrganizationCreateMin & {
  organization_categories?: OrganizationCategory['id'][];
  organization_first_contact_person?: ContactPersonCreate;
  notes?: NotesCreate;
};

export const emptyOrganization: OrganizationCreate = {
  ...emptyOrganizationMin,
  organization_categories: [],
  notes: emptyNotes,
  organization_first_contact_person: emptyContactPerson,
};
