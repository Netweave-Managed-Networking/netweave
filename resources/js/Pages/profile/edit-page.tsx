import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { PageProps } from '@/types/page-props.type';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './partials/delete-user-form';
import DisplayUserRole from './partials/display-user-role';
import UpdatePasswordForm from './partials/update-password-form';
import UpdateProfileInformationForm from './partials/update-profile-information-form';

export default function EditPage({ auth, mustVerifyEmail, status }: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
  return (
    <AuthenticatedLayout user={auth.user} header={<h2 className="text-xl leading-tight font-semibold text-gray-800">Profile</h2>}>
      <Head title="Profile" />

      <div className="py-12">
        <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
          <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
            <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} className="max-w-xl" />
          </div>

          <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
            <DisplayUserRole className="max-w-xl" />
          </div>

          <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
            <UpdatePasswordForm className="max-w-xl" />
          </div>

          <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
            <DeleteUserForm className="max-w-xl" />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
