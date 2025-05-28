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
      header={<h2 className="text-xl leading-tight font-semibold text-gray-800">Organisationskategorien verwalten</h2>}
    >
      <Head title="Organisationskategorien verwalten" />

      <div className="h-screen overflow-auto py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <OrganizationCategoriesEdit organizationCategories={organizationCategories} />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
