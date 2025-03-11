import CheckMark from '@/Components/Icon/CheckMark';
import CrossMark from '@/Components/Icon/CrossMark';
import { InvitationCodeAddButton } from '@/Components/InvitationCodes/InvitationCodeAddButton';
import { InvitationCodeDeleteButton } from '@/Components/InvitationCodes/InvitationCodeDeleteButton';
import InvitationCodeInvitationLinkButton from '@/Components/InvitationCodes/InvitationCodeInvitationLinkButton';
import { UserDeleteButton } from '@/Components/Users/UserDeleteButton';

import Table, { Row } from '@/Components/Util/Table';
import { InvitationCode } from '@/types/invitation-code.model';
import { UserMin } from '@/types/user-min.model';
import { ReactNode } from 'react';

export interface InvitationCodesTableProps {
  showAddCodeButton: boolean;
  invitationCodes: InvitationCode[];
}

export function InvitationCodesTable({
  showAddCodeButton,
  invitationCodes,
}: InvitationCodesTableProps) {
  const addCodeButtonRow: Row | undefined = showAddCodeButton
    ? createAddCodeButtonRow()
    : undefined;

  const tableRows = createRows(invitationCodes, addCodeButtonRow);

  return (
    <Table
      headerTitles={[
        'code',
        'Anwendbar',
        'Eingeladen',
        'Angelegt Durch',
        'Löschen',
      ]}
      rowItems={tableRows}
    />
  );
}

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
