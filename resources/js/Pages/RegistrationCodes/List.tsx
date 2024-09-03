import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, RegistrationCode } from '@/types';
import { Head } from '@inertiajs/react';

export default function List({
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
          {registrationCodes.map(registrationCode => {
            return (
              <div
                key={registrationCode.id}
                className="p-4 sm:p-8 bg-white shadow sm:rounded-lg"
              >
                {registrationCode.code}
              </div>
            );
          })}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
