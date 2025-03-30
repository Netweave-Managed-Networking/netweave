import { ContactPerson } from './contact-person.model';
import { OrganizationCategory } from './organization-category.model';
import { OrganizationLi } from './organization-li.model';
import { OrganizationNotes } from './organization-notes.model';

/** organization detailed which is given by OrganizationController @ edit */
export interface Organization extends OrganizationLi {
  notes: OrganizationNotes[];
  organization_categories: OrganizationCategory[];
  contact_persons: ContactPerson[];
}
