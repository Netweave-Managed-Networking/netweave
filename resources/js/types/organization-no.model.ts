import { OrganizationMin } from './organization-min.model';
import { Organization } from './organization.model';

/** organization with notes, restrictions and criteria which is given by RestrictionNotesCoopCriteriaCreateController @ create */
export interface OrganizationNo extends OrganizationMin, Pick<Organization, 'notes'> {}
