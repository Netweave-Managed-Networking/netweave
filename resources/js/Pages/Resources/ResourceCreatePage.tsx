import { ResourceCreate } from '@/Components/Resources/ResourceCreate';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
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
        <h2 className="text-xl leading-tight font-semibold text-gray-800">
          <strong>{organization.name}</strong>: Ressource oder Bedarf zuordnen
        </h2>
      }
    >
      <Head title="Ressource oder Bedarf zuordnen" />

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <ResourceCreate organization={organization} resourceCategories={resourceCategories} />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
