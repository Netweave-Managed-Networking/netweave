import { OrganizationCreate } from '@/components/organizations/organization-create';
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
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
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
