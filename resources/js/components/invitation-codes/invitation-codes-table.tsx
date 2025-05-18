import CheckMark from '@/components/icon/check-mark';
import CrossMark from '@/components/icon/cross-mark';
import { InvitationCodeAddButton } from '@/components/invitation-codes/invitation-code-add-button';
import { InvitationCodeDeleteButton } from '@/components/invitation-codes/invitation-code-delete-button';
import InvitationCodeInvitationLinkButton from '@/components/invitation-codes/invitation-code-invitation-link-button';
import { UserDeleteButton } from '@/components/users/user-delete-button';

import Table, { Row } from '@/components/util/table';
import { InvitationCode } from '@/types/invitation-code.model';
import { UserMin } from '@/types/user-min.model';
import { ReactNode } from 'react';

export interface InvitationCodesTableProps {
  showAddCodeButton: boolean;
  invitationCodes: InvitationCode[];
}

export function InvitationCodesTable({ showAddCodeButton, invitationCodes }: InvitationCodesTableProps) {
  const addCodeButtonRow: Row | undefined = showAddCodeButton ? createAddCodeButtonRow() : undefined;

  const tableRows = createRows(invitationCodes, addCodeButtonRow);

  return <Table headerTitles={['code', 'Anwendbar', 'Eingeladen', 'Angelegt Durch', 'Löschen']} rowItems={tableRows} />;
}

const createRows = (invitationCodes: InvitationCode[], addCodeButtonRow: Row | undefined): Row[] => [
  ...(addCodeButtonRow ? [addCodeButtonRow] : []),
  ...invitationCodes.map(({ id, code, editor, admin }) => ({
    key: code,
    nodes: [
      code,
      editor ? <CrossMark /> : <CheckMark />,
      editor ? userMail(editor) : <InvitationCodeInvitationLinkButton code={code} />,
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
  <a className="text-blue-800" href={`mailto:${user.email}`} aria-label={`Email ${user.name}`}>
    {user.name}
  </a>
);
