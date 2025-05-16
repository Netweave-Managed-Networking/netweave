import { ResourceCreate } from '@/components/resources/resource-create';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { OrganizationMin } from '@/types/organization-min.model';
import { PageProps } from '@/types/page-props.type';
import { ResourceCategory } from '@/types/resource-category.model';
import { Head } from '@inertiajs/react';

export default function ResourceCreatePage({
  auth,
  organization,
  resourceCategories,
}: PageProps<{
  organization: OrganizationMin;
  resourceCategories: ResourceCategory[];
}>) {
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          <strong>{organization.name}</strong>: Ressource oder Bedarf zuordnen
        </h2>
      }
    >
      <Head title="Ressource oder Bedarf zuordnen" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <ResourceCreate
            organization={organization}
            resourceCategories={resourceCategories}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
