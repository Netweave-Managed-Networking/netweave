import { OrganizationCategoriesEdit } from '@/component/organization-categories/organization-categories-edit';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { OrganizationCategory } from '@/types/organization-category.model';
import { PageProps } from '@/types/page-props.type';
import { Head } from '@inertiajs/react';

export default function OrganizationCategoriesEditPage({
  auth,
  organizationCategories,
}: PageProps<{
  organizationCategories: OrganizationCategory[];
}>) {
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
          <OrganizationCategoriesEdit
            organizationCategories={organizationCategories}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
