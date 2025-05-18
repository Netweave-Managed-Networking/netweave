import OrganizationsList from '@/component/organizations/organizations-list';
import { NavTile } from '@/component/utils/nav-tile';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { PageProps } from '@/types/page-props.type';
import { Head } from '@inertiajs/react';
import AddCircleOutline from '@mui/icons-material/AddCircleOutline';
import BuildCircleOutlined from '@mui/icons-material/BuildCircleOutlined';

export default function HomePage({ auth }: PageProps) {
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Home
        </h2>
      }
    >
      <Head title="Home" />

      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="pb-3 pt-12">
          <NavTile
            title="Kategorien verwalten"
            href="/organization-categories/edit"
            icon={<BuildCircleOutlined fontSize="medium" />}
          />
        </div>

        <div className="py-3">
          <NavTile
            title="Neue Organisation anlegen"
            href="/organizations/create"
            icon={<AddCircleOutline fontSize="medium" />}
          />
        </div>

        <div className="py-3" style={{ height: '60vh', overflow: 'auto' }}>
          <OrganizationsList />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
