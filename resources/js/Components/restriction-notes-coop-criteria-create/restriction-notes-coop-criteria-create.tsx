import PrimaryButton from '@/components/input/primary-button';
import SecondaryButton from '@/components/input/secondary-button';
import { readRedirectToFromHTMLButtonName } from '@/helpers/read-redirect-to-from-html-button-name.helper';
import {
  CoopCriteriaCreate,
  CoopCriteriaCreateErrors,
  emptyCoopCriteria,
} from '@/types/coop-criteria-create.model';
import { OrganizationNo } from '@/types/organization-no.model';

import { transformNestedStringifiedPropertiesToObject } from '@/helpers/transform-nested-stringified-properties-to-object';
import {
  emptyNotes,
  NotesCreate,
  NotesCreateErrors,
} from '@/types/notes-create.model';
import {
  emptyRestriction,
  RestrictionCreate,
  RestrictionCreateErrors,
} from '@/types/restriction-create.model';
import {
  emptyRestrictionNotesCoopCriteriaCreate,
  RestrictionNotesCoopCriteriaCreateErrors,
  RestrictionNotesCoopCriteriaCreate as RestrictionNotesCoopCriteriaCreateModel,
} from '@/types/restriction-notes-coop-criteria-create.model';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, SyntheticEvent, useEffect, useState } from 'react';
import { CoopCriteriaInput } from '../coop-criteria/coop-criteria-input';
import { NotesInput } from '../notes/notes-input';
import { RestrictionInput } from '../restrictions/restriction-input';

export interface RestrictionNotesCoopCriteriaCreateProps {
  organization: OrganizationNo;
}

export function RestrictionNotesCoopCriteriaCreate({
  organization,
}: RestrictionNotesCoopCriteriaCreateProps) {
  const [restrictionThematic, setRestrictionThematic] =
    useState<RestrictionCreate>(emptyRestriction('thematic'));

  const [restrictionRegional, setRestrictionRegional] =
    useState<RestrictionCreate>(emptyRestriction('regional'));

  const [coopCriteria, setCoopCriteria] =
    useState<CoopCriteriaCreate>(emptyCoopCriteria);

  const [notes, setNotes] = useState<NotesCreate>(
    organization.notes ?? emptyNotes
  );

  const { data, setData, post, errors, processing } =
    useForm<RestrictionNotesCoopCriteriaCreateModel>(
      emptyRestrictionNotesCoopCriteriaCreate(organization.id)
    );

  const [coopCriteriaErrors, setCoopCriteriaErrors] =
    useState<CoopCriteriaCreateErrors>({});
  const [restrictionThematicErrors, setRestrictionThematicErrors] =
    useState<RestrictionCreateErrors>({});
  const [restrictionRegionalErrors, setRestrictionRegionalErrors] =
    useState<RestrictionCreateErrors>({});
  const [notesErrors, setNotesErrors] = useState<NotesCreateErrors>({});

  const clearAllInputsAndErrors = () => {
    setRestrictionThematic(emptyRestriction('thematic'));
    setRestrictionRegional(emptyRestriction('regional'));
    setCoopCriteria(emptyCoopCriteria);
    setNotes(organization.notes ?? emptyNotes);
    setCoopCriteriaErrors({});
    setRestrictionThematicErrors({});
    setRestrictionRegionalErrors({});
    setNotesErrors({});
    setData(emptyRestrictionNotesCoopCriteriaCreate(organization.id));
  };

  // transform strangely nested errors to RestrictionNotesCoopCriteriaCreateErrors object
  useEffect(() => {
    const errorsMapped: RestrictionNotesCoopCriteriaCreateErrors =
      transformNestedStringifiedPropertiesToObject(errors);

    setCoopCriteriaErrors(errorsMapped.coop_criteria ?? {});
    setRestrictionThematicErrors(errorsMapped.restriction_thematic ?? {});
    setRestrictionRegionalErrors(errorsMapped.restriction_regional ?? {});
    setNotesErrors(errorsMapped.notes ?? {});
  }, [errors]);

  const handleSubmit: FormEventHandler = (
    e: SyntheticEvent<HTMLFormElement, SubmitEvent>
  ) => {
    e.preventDefault();
    const redirectTo = readRedirectToFromHTMLButtonName(
      e.nativeEvent.submitter as HTMLButtonElement
    );

    data.coop_criteria = coopCriteria;
    data.restriction_thematic = restrictionThematic;
    data.restriction_regional = restrictionRegional;
    data.notes = notes;

    post(
      route('restrictions-coop_criteria-notes.store', {
        organization: organization.id,
        redirect_to: redirectTo,
      }),
      { onSuccess: clearAllInputsAndErrors }
    );
  };

  return (
    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
      <div className="p-6 bg-white border-b border-gray-200">
        <form
          onSubmit={handleSubmit}
          onKeyDown={e => (e.key === 'Enter' ? e.preventDefault() : void 0)}
          className="space-y-6"
        >
          <CoopCriteriaInput
            autoFocus
            onChange={data => setCoopCriteria(data)}
            errors={coopCriteriaErrors}
          />
          <RestrictionInput
            type="thematic"
            onChange={data => setRestrictionThematic(data)}
            errors={restrictionThematicErrors}
          />
          <RestrictionInput
            type="regional"
            onChange={data => setRestrictionRegional(data)}
            errors={restrictionRegionalErrors}
          />
          <NotesInput
            value={notes}
            onChange={data => setNotes(data)}
            errors={notesErrors}
          />

          {/* Buttons */}
          <div className="flex justify-between mt-4 w-full">
            <SecondaryButton
              className="mr-4"
              disabled={processing}
              type="button"
              onClick={() => history.back()}
            >
              Zurück
            </SecondaryButton>
            <PrimaryButton
              className="ml-4"
              disabled={processing}
              name="redirect_to:/home" // TODO redirect_to stakeholder detail page (not yet implemented)
              type="submit"
            >
              Fertig
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}
