import OrganizationCategoryAdd from '@/Components/OrganizationCategories/OrganizationCategoryAdd';
import OrganizationCategoryEdit from '@/Components/OrganizationCategories/OrganizationCategoryEdit';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useToast } from '@/Providers/ToastProvider';
import { OrganizationCategory } from '@/types/organization-category.model';
import { PageProps } from '@/types/page-props.type';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function OrganizationCategoriesEditPage({
  auth,
  organizationCategories,
}: PageProps<{
  organizationCategories: OrganizationCategory[];
}>) {
  const { showToast: setToast } = useToast();
  const [categories, setCategories] = useState([...organizationCategories]);

  useEffect(
    // this is kind of a hack to set the categories state value to the organizationCategories PageProp value (after an "update" or "delete" operation)
    // this needs to be done because the state value is only updated in case of an "add" (api returns json in that case)
    // the state value will not be updated by the frontend in case of an update or delete (because here a redirect with new page props happens)
    // in case of an update or delete the backend will redirect to the same page with the updated organizationCategories page prop value
    // which is why we need to update the state value every time the organizationCategories prop value might have changed
    () => setCategories([...organizationCategories]),
    [organizationCategories]
  );

  const addCategorySorted = (newCategory: OrganizationCategory) => {
    setCategories(
      [...categories, newCategory].sort((a, b) => a.name.localeCompare(b.name))
    );
  };

  const showToastCategoryCreated = (newCategory: OrganizationCategory) => {
    setToast(
      `Organisationskategorie '${newCategory.name}' erstellt.`,
      'success'
    );
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          Organisationskategorien verwalten
        </h2>
      }
    >
      <Head title="Organisationskategorien verwalten" />

      <div className="py-12 overflow-auto h-screen">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <OrganizationCategoryAdd
            onOrganizationCategoryAdd={newCategory => {
              if (newCategory) {
                addCategorySorted(newCategory);
                showToastCategoryCreated(newCategory);
              }
            }}
          />
          {categories.map(category => (
            <OrganizationCategoryEdit
              key={category.id}
              organizationCategory={category}
            />
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
