import HeaderParagraphInfoModalButton from '@/Components/HeaderParagraphInfoModalButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import OrganizationCategoriesSelectAdd from '@/Components/OrganizationCategoriesSelectAdd';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { OrganizationCategory } from '@/types/organization-category.model';
import { PageProps } from '@/types/page-props.type';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function OrganizationsCreate({
  auth,
  organizationCategories,
}: PageProps<{
  organizationCategories: OrganizationCategory[];
}>) {
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const { data, setData, post, errors, processing } = useForm({
    name: '',
    email: '',
    phone: '',
    postcode_city: '',
    street_hnr: '',
    organization_categories: [] as number[],
  });

  const handleSubmit: FormEventHandler = e => {
    e.preventDefault();

    data.organization_categories = selectedCategories;
    post(route('organizations.store')); // posts data
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          Neue Organisation anlegen
        </h2>
      }
    >
      <Head title="Create Organization" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Organization Name */}
                <div>
                  <InputLabel
                    htmlFor="name"
                    value="Name der Organisation"
                    required
                  />
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
                <InputLabel value="Kategorien" required />
                <div className="flex">
                  <span>
                    <OrganizationCategoriesSelectAdd
                      organizationCategories={organizationCategories}
                      onChange={selected => setSelectedCategories(selected)}
                    />
                  </span>
                  <span>
                    <HeaderParagraphInfoModalButton
                      infoButtonTooltip="Infos zu den Kategorien"
                      modalTitle="Beschreibungen der Organisations-Kategorien"
                      items={organizationCategories.map(cat => ({
                        header: cat.name,
                        paragraph: cat.description ?? '',
                      }))}
                    />
                  </span>
                </div>
                <InputError
                  message={errors.organization_categories}
                  className="mt-2"
                />
                {/* Email */}
                <div>
                  <InputLabel htmlFor="email" value="Email der Organisation" />
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
                <div>
                  <InputLabel
                    htmlFor="phone"
                    value="Telefonnummer der Organisation"
                  />
                  <TextInput
                    id="phone"
                    value={data.phone}
                    onChange={e => setData('phone', e.target.value)}
                    className="mt-1 block w-full"
                  />
                  <InputError message={errors.phone} className="mt-2" />
                </div>
                {/* Postcode and City */}
                <div>
                  <InputLabel
                    htmlFor="postcode_city"
                    value="PLZ und Stadt der Organisation"
                  />
                  <TextInput
                    id="postcode_city"
                    value={data.postcode_city}
                    onChange={e => setData('postcode_city', e.target.value)}
                    className="mt-1 block w-full"
                  />
                  <InputError message={errors.postcode_city} className="mt-2" />
                </div>
                {/* Street and House Number */}
                <div>
                  <InputLabel
                    htmlFor="street_hnr"
                    value="Straße und Hausnummer der Organisation"
                  />
                  <TextInput
                    id="street_hnr"
                    value={data.street_hnr}
                    onChange={e => setData('street_hnr', e.target.value)}
                    className="mt-1 block w-full"
                  />
                  <InputError message={errors.street_hnr} className="mt-2" />
                </div>
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
                      type="submit"
                      className="ml-4"
                      disabled={processing}
                    >
                      Fertig
                    </PrimaryButton>
                    <PrimaryButton
                      className="ml-4"
                      disabled={true /*processing*/}
                      type="button" /*submit*/
                    >
                      Ressourcen hinzufügen
                    </PrimaryButton>
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
