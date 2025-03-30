import PrimaryButton from '@/Components/Input/PrimaryButton';
import SecondaryButton from '@/Components/Input/SecondaryButton';
import { readRedirectToFromHTMLButtonName } from '@/helpers/readRedirectToFromHTMLButtonName.helper';
import { transformNestedStringifiedPropertiesToObject } from '@/helpers/transformNestedStringifiedPropertiesToObject';
import {
  ContactPersonCreate,
  ContactPersonCreateErrors,
  emptyContactPerson,
} from '@/types/contact-person-create.model';
import { OrganizationCategory } from '@/types/organization-category.model';
import {
  emptyOrganization,
  OrganizationCreate as OrganizationCreateModel,
  orgMax,
} from '@/types/organization-create.model';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, SyntheticEvent, useEffect, useState } from 'react';
import { ContactPersonInput } from '../ContactPersons/ContactPersonInput';
import HoverInfoButton from '../Util/HoverInfoButton';
import { OrganizationInput } from './OrganizationInput';

import InputError from '../Input/InputError';
import InputLabel from '../Input/InputLabel';
import TextArea from '../Input/TextArea';
import OrganizationCategoriesSelectAdd from '../OrganizationCategories/OrganizationCategoriesSelectAdd';
import HPItemsInfoModalButton from '../Util/HPItemsInfoModalButton';
import { MaxTextSize } from '../Util/MaxTextSize';

export function OrganizationCreate({
  organizationCategories,
}: {
  organizationCategories: OrganizationCategory[];
}) {
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [contactPerson, setContactPerson] =
    useState<ContactPersonCreate>(emptyContactPerson);
  const [contactPersonIsPristine, setContactPersonPristine] =
    useState<boolean>(true);

  const { data, setData, post, errors, processing } =
    useForm<OrganizationCreateModel>(emptyOrganization);
  const [contactPersonErrors, setContactPersonErrors] =
    useState<ContactPersonCreateErrors>({});

  // transform strangely nested errors to ContactPersonError object
  useEffect(() => {
    const contactPersonErrors = transformNestedStringifiedPropertiesToObject<{
      organization_first_contact_person?: ContactPersonCreateErrors;
    }>(errors).organization_first_contact_person;
    if (contactPersonErrors) setContactPersonErrors(contactPersonErrors);
  }, [errors]);

  const handleSubmit: FormEventHandler = (
    e: SyntheticEvent<HTMLFormElement, SubmitEvent>
  ) => {
    e.preventDefault();
    const redirectTo = readRedirectToFromHTMLButtonName(
      e.nativeEvent.submitter as HTMLButtonElement
    );
    data.organization_categories = selectedCategories;
    data.organization_first_contact_person = contactPerson;
    post(route('organizations.store', { redirect_to: redirectTo }));
  };

  return (
    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
      <div className="p-6 bg-white border-b border-gray-200">
        <form
          onSubmit={handleSubmit}
          onKeyDown={e => (e.key === 'Enter' ? e.preventDefault() : void 0)}
          className="space-y-6"
        >
          <OrganizationInput
            isNameRequired={true}
            onChange={newData => setData({ ...data, ...newData })}
            errors={errors}
            slotTop={
              <>
                {/* Categories */}
                <div>
                  <InputLabel value="Kategorien" required />
                  <div className="flex">
                    <span>
                      <OrganizationCategoriesSelectAdd
                        organizationCategories={organizationCategories}
                        organizationCategoriesSelected={selectedCategories}
                        onChange={selected => setSelectedCategories(selected)}
                      />
                    </span>
                    <span>
                      <HPItemsInfoModalButton
                        infoButtonTooltip="Infos zu den Kategorien"
                        modalTitle="Beschreibungen der Organisationskategorien"
                        items={organizationCategories.map(cat => ({
                          header: cat.name,
                          paragraph: cat.description ?? '',
                        }))}
                      />
                    </span>
                  </div>
                  {errors.organization_categories && (
                    <InputError message="Wähle mindestens eine Organisationskategorie aus." />
                  )}
                </div>
              </>
            }
            slotRight={
              <>
                {/* First Contact Person */}
                <div className="w-1/2 p-5 bg-gray-300 rounded-md">
                  <span className="flex justify-between">
                    <h3>Ansprechpartnerin / -partner hinzufügen</h3>
                    <HoverInfoButton
                      message={
                        <>
                          <em>optional.</em>
                          <br />
                          <span>
                            Später können noch weitere AnsprechpartnerInnen
                            hinzugefügt werden.
                          </span>
                        </>
                      }
                    />
                  </span>
                  <ContactPersonInput
                    isNameRequired={!contactPersonIsPristine}
                    onChange={(data, isPristine) => (
                      setContactPerson(data),
                      setContactPersonPristine(isPristine)
                    )}
                    errors={contactPersonErrors}
                  />
                </div>
              </>
            }
            slotBottom={
              <>
                {/* Notes */}
                <div className="flex justify-between">
                  <InputLabel
                    htmlFor="notes"
                    value="Notizen zum Wesen / Charakter der Organisation"
                  />
                  <MaxTextSize value={data.notes} max={orgMax.notes} />
                </div>
                <TextArea
                  id="notes"
                  value={data.notes}
                  onChange={e => setData('notes', e.target.value)}
                  rows={8}
                  className="mt-1 block w-full"
                />
                <InputError message={errors.notes} className="mt-2" />
              </>
            }
          />

          {/* Buttons */}
          <div className="flex justify-between mt-4 w-full">
            <SecondaryButton
              className="float-start"
              disabled={processing}
              type="button"
              onClick={() => history.back()}
            >
              Abbrechen
            </SecondaryButton>
            <span>
              <PrimaryButton
                className="ml-4"
                disabled={processing}
                name="redirect_to:/home"
                type="submit"
              >
                Fertig
              </PrimaryButton>

              <PrimaryButton
                className="ml-4"
                disabled={processing}
                name="redirect_to:/organizations/{id}/resources/create"
                type="submit"
              >
                Ressourcen hinzufügen
              </PrimaryButton>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
