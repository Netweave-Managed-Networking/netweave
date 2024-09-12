import CheckMark from '@/Components/CheckMark';
import CrossMark from '@/Components/CrossMark';
import { RegistrationCodeAddButton } from '@/Components/RegistrationCodeAddButton';
import Table, { Row } from '@/Components/Table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, User } from '@/types';
import { RegistrationCode } from '@/types/registration-code.model';
import { UserMin } from '@/types/user-min.model';
import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';

export default function RegistrationCodesTable({
  auth,
  registrationCodes,
}: PageProps<{ registrationCodes: RegistrationCode[] }>) {
  const showAddCodeButton =
    !hasActiveAdminAlreadyCreatedOneStillUnusedRegistrationCode(
      registrationCodes,
      auth.user
    );

  const addCodeButtonRow: Row | undefined = showAddCodeButton
    ? {
        key: 'RegistrationCodeAddButton',
        nodes: [
          <RegistrationCodeAddButton key={'RegistrationCodeAddButton'} />,
        ],
      }
    : undefined;

  const tableRows = createRows(registrationCodes, addCodeButtonRow);

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
            headerTitles={['code', 'usable', 'used by', 'admin']}
            rowItems={tableRows}
          ></Table>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

const hasActiveAdminAlreadyCreatedOneStillUnusedRegistrationCode = (
  registrationCodes: RegistrationCode[],
  admin: User
): boolean =>
  registrationCodes
    .filter(registrationCode => registrationCode.admin_id === admin.id)
    .filter(registrationCode => registrationCode.editor_id === null).length > 0;

const createRows = (
  registrationCodes: RegistrationCode[],
  addCodeButtonRow?: Row
): Row[] => [
  ...(addCodeButtonRow ? [addCodeButtonRow] : []),
  ...registrationCodes.map(({ code, editor, admin }) => ({
    key: code,
    nodes: [
      code,
      editor ? <CrossMark /> : <CheckMark />,
      editor ? userMail(editor) : '-' /* TODO replace '-' by invitation link */,
      userMail(admin),
    ],
  })),
];

const userMail = (user: UserMin): ReactNode => (
  <a
    className="text-blue-800"
    href={`mailto:${user.email}`}
    aria-label={`Email ${user.name}`}
  >
    {user.name}
  </a>
);
