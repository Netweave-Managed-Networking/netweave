import { InvitationCodesTable } from '@/component/invitation-codes/invitation-codes-table';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { InvitationCode } from '@/types/invitation-code.model';
import { PageProps } from '@/types/page-props.type';
import { User } from '@/types/user.model';
import { Head } from '@inertiajs/react';

export default function InvitationCodesPage({ auth, invitationCodes }: PageProps<{ invitationCodes: InvitationCode[] }>) {
  const admin = auth.user;
  const showAddCodeButton = !hasActiveAdminAlreadyCreatedOneStillUnusedInvitationCode(invitationCodes, admin);

  return (
    <AuthenticatedLayout user={admin} header={<h2 className="text-xl leading-tight font-semibold text-gray-800">User & Einladungen</h2>}>
      <Head title="User & Einladungen" />

      <div className="py-12">
        <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
          <InvitationCodesTable showAddCodeButton={showAddCodeButton} invitationCodes={invitationCodes} />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

const hasActiveAdminAlreadyCreatedOneStillUnusedInvitationCode = (invitationCodes: InvitationCode[], admin: User): boolean =>
  invitationCodes.filter((invitationCode) => invitationCode.admin_id === admin.id).filter((invitationCode) => invitationCode.editor_id === null)
    .length > 0;
