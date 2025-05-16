import { RestrictionNotesCoopCriteriaCreate } from '@/components/restriction-notes-coop-criteria-create/restriction-notes-coop-criteria-create';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { OrganizationNo } from '@/types/organization-no.model';
import { PageProps } from '@/types/page-props.type';
import { Head } from '@inertiajs/react';

export default function RestrictionNotesCoopCriteriaCreatePage({
  auth,
  organization,
}: PageProps<{
  organization: OrganizationNo;
}>) {
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="text-xl leading-tight font-semibold text-gray-800">Kriterien & Einschränkungen ergänzen</h2>}
    >
      <Head title="Kriterien & Einschränkungen ergänzen" />

      <div className="h-screen overflow-auto py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <RestrictionNotesCoopCriteriaCreate organization={organization} />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
