import CheckMark from '@/Components/Icon/CheckMark';
import CrossMark from '@/Components/Icon/CrossMark';
import { InvitationCodeAddButton } from '@/Components/InvitationCodes/InvitationCodeAddButton';
import { InvitationCodeDeleteButton } from '@/Components/InvitationCodes/InvitationCodeDeleteButton';
import InvitationCodeInvitationLinkButton from '@/Components/InvitationCodes/InvitationCodeInvitationLinkButton';
import { UserDeleteButton } from '@/Components/Users/UserDeleteButton';

import Table, { Row } from '@/Components/Util/Table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { InvitationCode } from '@/types/invitation-code.model';
import { PageProps } from '@/types/page-props.type';
import { UserMin } from '@/types/user-min.model';
import { User } from '@/types/user.model';
import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';

export default function InvitationCodesPage({
  auth,
  invitationCodes,
}: PageProps<{ invitationCodes: InvitationCode[] }>) {
  const showAddCodeButton =
    !hasActiveAdminAlreadyCreatedOneStillUnusedInvitationCode(
      invitationCodes,
      auth.user
    );

  const addCodeButtonRow: Row | undefined = showAddCodeButton
    ? createAddCodeButtonRow()
    : undefined;

  const tableRows = createRows(invitationCodes, addCodeButtonRow);

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          User & Einladungen
        </h2>
      }
    >
      <Head title="User & Einladungen" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          <Table
            headerTitles={[
              'code',
              'Anwendbar',
              'Eingeladen',
              'Angelegt Durch',
              'Löschen',
            ]}
            rowItems={tableRows}
          ></Table>
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

const createRows = (
  invitationCodes: InvitationCode[],
  addCodeButtonRow: Row | undefined
): Row[] => [
  ...(addCodeButtonRow ? [addCodeButtonRow] : []),
  ...invitationCodes.map(({ id, code, editor, admin }) => ({
    key: code,
    nodes: [
      code,
      editor ? <CrossMark /> : <CheckMark />,
      editor ? (
        userMail(editor)
      ) : (
        <InvitationCodeInvitationLinkButton code={code} />
      ),
      userMail(admin),
      createDeleteButton(id, editor),
    ],
  })),
];

const createAddCodeButtonRow = () => ({
  key: 'InvitationCodeAddButton',
  nodes: [<InvitationCodeAddButton key={'InvitationCodeAddButton'} />],
});

const createDeleteButton = (codeId: number, editor: UserMin | null) =>
  editor ? (
    <UserDeleteButton key={`delete_user_${editor.id}`} user={editor} />
  ) : (
    <InvitationCodeDeleteButton key={`delete_code_${codeId}`} id={codeId} />
  );

const userMail = (user: UserMin): ReactNode => (
  <a
    className="text-blue-800"
    href={`mailto:${user.email}`}
    aria-label={`Email ${user.name}`}
  >
    {user.name}
  </a>
);
