import OrganizationsList from '@/Components/Organizations/OrganizationsList';
import { NavTile } from '@/Components/Util/NavTile';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types/page-props.type';
import { Head } from '@inertiajs/react';
import AddCircleOutline from '@mui/icons-material/AddCircleOutline';
import BuildCircleOutlined from '@mui/icons-material/BuildCircleOutlined';

export default function HomePage({ auth }: PageProps) {
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          Home
        </h2>
      }
    >
      <Head title="Home" />

      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="pt-12 pb-3">
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
