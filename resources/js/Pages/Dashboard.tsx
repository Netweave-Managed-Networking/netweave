import OrganizationsList from '@/Components/OrganizationsList';
import { Tile } from '@/Components/Tile';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types/page-props.type';
import { Head } from '@inertiajs/react';
import AddCircleOutline from '@mui/icons-material/AddCircleOutline';

export default function Dashboard({ auth }: PageProps) {
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          Dashboard
        </h2>
      }
    >
      <Head title="Dashboard" />

      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="pt-12 pb-3">
          <a href="/organizations/create">
            <Tile>
              <AddCircleOutline fontSize="medium" />
              <span>Neue Organisation anlegen</span>
            </Tile>
          </a>
        </div>

        <div className="py-3" style={{ height: '60vh', overflow: 'auto' }}>
          <OrganizationsList />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
