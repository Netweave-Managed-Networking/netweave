import {
  ContactPersonCreate,
  emptyContactPerson,
} from './contact-person-create.model';
import { PickStringAsNumber } from './max-string-lengths.type';
import { OrganizationCategory } from './organization-category.model';
import { OrganizationNotes } from './organization-notes.model';
import { Organization } from './organization.model';

export type OrganizationCreate = Partial<
  Pick<
    Organization,
    'name' | 'email' | 'phone' | 'postcode_city' | 'street_hnr'
  > & {
    notes: OrganizationNotes['notes'];
    organization_categories: OrganizationCategory['id'][];
    organization_first_contact_person: ContactPersonCreate;
  }
>;

export const emptyOrganization: OrganizationCreate = {
  name: '',
  email: '',
  phone: '',
  postcode_city: '',
  street_hnr: '',

  notes: '',
  organization_categories: [],
  organization_first_contact_person: emptyContactPerson,
};

/** these numbers are derived from the database limits */
export const orgMax: PickStringAsNumber<OrganizationCreate> = {
  name: 127,
  email: 63,
  phone: 63,
  postcode_city: 63,
  street_hnr: 127,
  notes: 4095,
};
