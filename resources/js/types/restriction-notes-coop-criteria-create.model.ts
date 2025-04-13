import {
  CoopCriteriaCreate,
  CoopCriteriaCreateErrors,
  emptyCoopCriteria,
} from './coop-criteria-create.model';
import {
  emptyNotes,
  NotesCreate,
  NotesCreateErrors,
} from './notes-create.model';
import { Organization } from './organization.model';
import {
  emptyRestriction,
  RestrictionCreate,
  RestrictionCreateErrors,
} from './restriction-create.model';

export type RestrictionNotesCoopCriteriaCreate = {
  restriction_thematic?: RestrictionCreate;
  restriction_regional?: RestrictionCreate;
  coop_criteria?: CoopCriteriaCreate;
  notes?: NotesCreate;
};

export const emptyRestrictionNotesCoopCriteriaCreate: (
  organization_id: Organization['id']
) => RestrictionNotesCoopCriteriaCreate = organization_id => ({
  restriction_thematic: emptyRestriction('thematic'),
  restriction_regional: emptyRestriction('regional'),
  coop_criteria: emptyCoopCriteria,
  notes: emptyNotes,
});

export type RestrictionNotesCoopCriteriaCreateErrors = {
  restriction_thematic?: RestrictionCreateErrors;
  restriction_regional?: RestrictionCreateErrors;
  coop_criteria?: CoopCriteriaCreateErrors;
  notes?: NotesCreateErrors;
};
