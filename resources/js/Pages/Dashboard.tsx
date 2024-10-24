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

      <div className="pt-12 pb-3">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">Du bist angemeldet!</div>
          </div>
        </div>
      </div>

      <div className="py-3">
        <a href="/stakeholder-organizations/create">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
              <div className="p-6 text-gray-900 flex gap-2">
                <AddCircleOutline fontSize="medium" />
                <span>Neue Organisation anlegen</span>
              </div>
            </div>
          </div>
        </a>
      </div>
    </AuthenticatedLayout>
  );
}
