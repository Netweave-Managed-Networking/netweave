import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import StakeholderCategoriesSelectAdd from '@/Components/StakeholderCategoriesSelectAdd';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types/page-props.type';
import { StakeholderCategoryMin } from '@/types/stakeholder-category-min.model';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function StakeholderOrganizationsCreate({
  auth,
  stakeholderCategories,
}: PageProps<{
  stakeholderCategories: StakeholderCategoryMin[];
}>) {
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const { data, setData, post, errors, processing } = useForm({
    name: '',
    email: '',
    phone: '',
    postcode_city: '',
    street_hnr: '',
    stakeholder_categories: [] as number[],
  });

  const handleSubmit: FormEventHandler = e => {
    e.preventDefault();

    data.stakeholder_categories = selectedCategories;
    post(route('stakeholder-organizations.store')); // posts data
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
      <Head title="Create Stakeholder Organization" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Categories */}
                <StakeholderCategoriesSelectAdd
                  stakeholderCategories={stakeholderCategories}
                  stakeholder_categories_errors={errors.stakeholder_categories}
                  onChange={selected => setSelectedCategories(selected)}
                />

                {/* Organization Name */}
                <div>
                  <InputLabel
                    htmlFor="name"
                    value="Name der Organisation"
                    required
                  />
                  <TextInput
                    id="name"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    required
                    className="mt-1 block w-full"
                  />
                  <InputError message={errors.name} className="mt-2" />
                </div>

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

                <div className="flex items-center justify-end mt-4">
                  <PrimaryButton className="ml-4" disabled={processing}>
                    Erstellen
                  </PrimaryButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
