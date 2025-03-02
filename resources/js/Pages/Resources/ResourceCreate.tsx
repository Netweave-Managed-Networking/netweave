import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Organization } from '@/types/organization.model';
import { PageProps } from '@/types/page-props.type';

export default function ResourceCreate({
  auth,
  organization,
  resourceCategories,
}: PageProps<{
  organization: Organization;
  resourceCategories: unknown[];
}>) {
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          <em>{organization.name}</em>
        </h2>
      }
    ></AuthenticatedLayout>
  );
}
