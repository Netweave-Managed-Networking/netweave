import { OrganizationCreate } from '@/component/organizations/organization-create';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { OrganizationCategory } from '@/types/organization-category.model';
import { PageProps } from '@/types/page-props.type';
import { Head } from '@inertiajs/react';

export default function OrganizationsCreatePage({
  auth,
  organizationCategories,
}: PageProps<{ organizationCategories: OrganizationCategory[] }>) {
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Neue Organisation anlegen
        </h2>
      }
    >
      <Head title="Create Organization" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <OrganizationCreate organizationCategories={organizationCategories} />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
