/* eslint-disable react/display-name */
import { User } from '@/types';
import { RegistrationCode } from '@/types/registration-code.model';
import { render, screen } from '@testing-library/react';
import RegistrationCodesTable from './RegistrationCodesTable';

// Mocking child components used in RegistrationCodesTable
jest.mock('@/Components/CheckMark', () => () => <div>CheckMark</div>);

jest.mock('@/Components/CrossMark', () => () => <div>CrossMark</div>);

jest.mock('@/Components/RegistrationCodeInvitationLinkButton', () => () => (
  <div>RegistrationCodeInvitationLinkButton</div>
));

jest.mock('@/Components/RegistrationCodeAddButton', () => ({
  RegistrationCodeAddButton: () => <button>Add Code</button>,
}));

jest.mock('@/Components/RegistrationCodeDeleteButton', () => ({
  RegistrationCodeDeleteButton: ({ id }: { id: number }) => (
    <button>Delete {id}</button>
  ),
}));

jest.mock('@inertiajs/react', () => ({
  Head: ({ title }: { title: string }) => <title>{title}</title>,
}));

// Mock the AuthenticatedLayout
jest.mock(
  '@/Layouts/AuthenticatedLayout',
  () =>
    ({ children }: { children: React.ReactNode }) => <div>{children}</div>
);

describe('RegistrationCodesTable', () => {
  const mockUser: User = {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
  } as User;

  const mockRegistrationCodes: RegistrationCode[] = [
    {
      id: 1,
      code: 'CODE123',
      admin_id: 1,
      editor_id: null, // still unused
      editor: null,
      admin: { id: 1, name: 'Admin User', email: 'admin@example.com' },
    },
    {
      id: 2,
      code: 'CODE456',
      admin_id: 1,
      editor_id: 2,
      editor: { id: 2, name: 'Editor User', email: 'editor@example.com' },
      admin: { id: 1, name: 'Admin User', email: 'admin@example.com' },
    },
  ] as RegistrationCode[];

  it('renders the table with registration codes', () => {
    render(
      <RegistrationCodesTable
        auth={{ user: mockUser }}
        registrationCodes={mockRegistrationCodes}
      />
    );

    expect(screen.getByText('User & Registrierungs-Codes')).toBeInTheDocument();
    expect(screen.getByText('CODE123')).toBeInTheDocument();
    expect(screen.getByText('CODE456')).toBeInTheDocument();
    expect(screen.getByText('CheckMark')).toBeInTheDocument(); // For unused code
    expect(screen.getByText('CrossMark')).toBeInTheDocument(); // For used code
  });

  it('shows the Add Code button if no unused code is available for the admin', () => {
    // Modify the registration codes to simulate the condition where no unused code exists
    const noUnusedCodes = [
      {
        id: 2,
        code: 'CODE456',
        admin_id: 1,
        editor_id: 2,
        editor: { id: 2, name: 'Editor User', email: 'editor@example.com' },
        admin: { id: 1, name: 'Admin User', email: 'admin@example.com' },
      },
    ] as RegistrationCode[];

    render(
      <RegistrationCodesTable
        auth={{ user: mockUser }}
        registrationCodes={noUnusedCodes}
      />
    );

    expect(screen.getByText('Add Code')).toBeInTheDocument();
  });

  it('does not show the Add Code button if an unused code is available for the admin', () => {
    render(
      <RegistrationCodesTable
        auth={{ user: mockUser }}
        registrationCodes={mockRegistrationCodes}
      />
    );

    expect(screen.queryByText('Add Code')).toBeNull();
  });

  it('renders delete buttons for unused codes', () => {
    render(
      <RegistrationCodesTable
        auth={{ user: mockUser }}
        registrationCodes={mockRegistrationCodes}
      />
    );

    expect(screen.getByText('Delete 1')).toBeInTheDocument(); // Unused code
    expect(screen.queryByText('Delete 2')).toBeNull(); // Used code
  });

  it('renders RegistrationCodeInvitationLinkButton buttons for unused codes', () => {
    render(
      <RegistrationCodesTable
        auth={{ user: mockUser }}
        registrationCodes={mockRegistrationCodes}
      />
    );

    expect(
      screen.getByText('RegistrationCodeInvitationLinkButton')
    ).toBeInTheDocument(); // Unused code
    expect(screen.queryByText('-')).toBeNull(); // Used code
  });
});
