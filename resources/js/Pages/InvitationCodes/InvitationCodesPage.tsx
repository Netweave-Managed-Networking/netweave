import { InvitationCodesTable } from '@/Components/InvitationCodes/InvitationCodesTable';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { InvitationCode } from '@/types/invitation-code.model';
import { PageProps } from '@/types/page-props.type';
import { User } from '@/types/user.model';
import { Head } from '@inertiajs/react';

export default function InvitationCodesPage({
  auth,
  invitationCodes,
}: PageProps<{ invitationCodes: InvitationCode[] }>) {
  const admin = auth.user;
  const showAddCodeButton =
    !hasActiveAdminAlreadyCreatedOneStillUnusedInvitationCode(
      invitationCodes,
      admin
    );

  return (
    <AuthenticatedLayout
      user={admin}
      header={
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          User & Einladungen
        </h2>
      }
    >
      <Head title="User & Einladungen" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          <InvitationCodesTable
            showAddCodeButton={showAddCodeButton}
            invitationCodes={invitationCodes}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

const hasActiveAdminAlreadyCreatedOneStillUnusedInvitationCode = (
  invitationCodes: InvitationCode[],
  admin: User
): boolean =>
  invitationCodes
    .filter(invitationCode => invitationCode.admin_id === admin.id)
    .filter(invitationCode => invitationCode.editor_id === null).length > 0;
