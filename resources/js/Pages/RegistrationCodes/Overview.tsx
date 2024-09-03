import Table from '@/Components/Table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, RegistrationCode } from '@/types';
import { Head } from '@inertiajs/react';

export default function Overview({
  auth,
  registrationCodes,
}: PageProps<{ registrationCodes: RegistrationCode[] }>) {
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          User & Registrierungs-Codes
        </h2>
      }
    >
      <Head title="User & Registrierungs-Codes" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          <Table
            headerTitles={['code', 'editor_id', 'admin_id']}
            rowItems={registrationCodes.map(code => [
              code.code,
              '' + (code.editor_id ?? ''),
              '' + code.admin_id,
            ])}
          ></Table>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
