import InputError from '@/Components/Input/InputError';
import InputLabel from '@/Components/Input/InputLabel';
import PrimaryButton from '@/Components/Input/PrimaryButton';
import SecondaryButton from '@/Components/Input/SecondaryButton';
import TextInput from '@/Components/Input/TextInput';
import OrganizationCategoriesSelectAdd from '@/Components/OrganizationCategories/OrganizationCategoriesSelectAdd';
import HPItemsInfoModalButton from '@/Components/Util/HPItemsInfoModalButton';
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
import { ContactPersonForm } from '../ContactPersons/ContactPersonForm';
import TextArea from '../Input/TextArea';
import HoverInfoButton from '../Util/HoverInfoButton';
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
          {/* Organization Name */}
          <div>
            <div className="flex justify-between">
              <InputLabel
                htmlFor="name"
                value="Name der Organisation"
                required
              />
              <MaxTextSize value={data.name} max={orgMax.name} />
            </div>
            <TextInput
              id="name"
              autoFocus
              value={data.name}
              onChange={e => setData('name', e.target.value)}
              required
              className="mt-1 block w-full"
            />
            <InputError message={errors.name} className="mt-2" />
          </div>

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

          {/* split between contact person and organization */}
          <div className="w-full flex items-end">
            {/* Organization */}
            <div className="w-1/2 p-5">
              {/* Email */}
              <div className="mt-5">
                <div className="flex justify-between">
                  <InputLabel htmlFor="email" value="Email der Organisation" />
                  <MaxTextSize value={data.email} max={orgMax.email} />
                </div>
                <TextInput
                  id="email"
                  pattern="^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$"
                  value={data.email}
                  onChange={e => setData('email', e.target.value)}
                  className="mt-1 block w-full"
                />
                <InputError message={errors.email} className="mt-2" />
              </div>

              {/* Phone */}
              <div className="mt-5">
                <div className="flex justify-between">
                  <InputLabel
                    htmlFor="phone"
                    value="Telefonnummer der Organisation"
                  />
                  <MaxTextSize value={data.phone} max={orgMax.phone} />
                </div>
                <TextInput
                  id="phone"
                  value={data.phone}
                  onChange={e => setData('phone', e.target.value)}
                  className="mt-1 block w-full"
                />
                <InputError message={errors.phone} className="mt-2" />
              </div>

              {/* Postcode and City */}
              <div className="mt-5">
                <div className="flex justify-between">
                  <InputLabel
                    htmlFor="postcode_city"
                    value="PLZ und Stadt der Organisation"
                  />
                  <MaxTextSize
                    value={data.postcode_city}
                    max={orgMax.postcode_city}
                  />
                </div>
                <TextInput
                  id="postcode_city"
                  value={data.postcode_city}
                  onChange={e => setData('postcode_city', e.target.value)}
                  className="mt-1 block w-full"
                />
                <InputError message={errors.postcode_city} className="mt-2" />
              </div>

              {/* Street and House Number */}
              <div className="mt-5">
                <div className="flex justify-between">
                  <InputLabel
                    htmlFor="street_hnr"
                    value="Straße und Hausnummer der Organisation"
                  />
                  <MaxTextSize
                    value={data.street_hnr}
                    max={orgMax.street_hnr}
                  />
                </div>
                <TextInput
                  id="street_hnr"
                  value={data.street_hnr}
                  onChange={e => setData('street_hnr', e.target.value)}
                  className="mt-1 block w-full"
                />
                <InputError message={errors.street_hnr} className="mt-2" />
              </div>
            </div>

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
              <ContactPersonForm
                isNameRequired={!contactPersonIsPristine}
                onChange={(data, isPristine) => (
                  setContactPerson(data), setContactPersonPristine(isPristine)
                )}
                errors={contactPersonErrors}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
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
          </div>

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
