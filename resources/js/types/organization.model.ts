import { ContactPerson } from './contact-person.model';
import { Notes } from './notes.model';
import { OrganizationCategory } from './organization-category.model';
import { OrganizationLi } from './organization-li.model';

/** organization detailed which is given by OrganizationController @ edit */
export interface Organization extends OrganizationLi {
  notes: Notes;
  organization_categories: OrganizationCategory[];
  contact_persons: ContactPerson[];
}
