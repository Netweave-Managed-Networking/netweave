import Table from '@/Components/Table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { RegistrationCode } from '@/types/registration-code.model';
import { Head } from '@inertiajs/react';

export default function Overview({
  auth,
  registrationCodes,
}: PageProps<{ registrationCodes: RegistrationCode[] }>) {
  const registrationCodesTableData = registrationCodes.map(
    ({ code, editor, admin }) => {
      const editorInfo = (editor?.name ?? '') + ', ' + (editor?.email ?? '');
      const adminInfo = admin?.name + ', ' + admin?.email;
      return [code, editorInfo, adminInfo];
    }
  );

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
            headerTitles={['code', 'editor', 'admin']}
            rowItems={registrationCodesTableData}
          ></Table>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
