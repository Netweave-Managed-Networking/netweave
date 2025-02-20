/* eslint-disable react/display-name */
import { mockInvitationCodes } from '@/testing/mock-invitation-codes.mock';
import { mockUser } from '@/testing/mock-users.mock';
import { InvitationCode } from '@/types/invitation-code.model';
import { UserMin } from '@/types/user-min.model';
import { render, screen } from '@testing-library/react';
import InvitationCodesTable from './InvitationCodesTable';

// Mocking child components used in InvitationCodesTable
jest.mock('@/Components/Icon/CheckMark', () => () => <div>CheckMark</div>);

jest.mock('@/Components/Icon/CrossMark', () => () => <div>CrossMark</div>);

jest.mock(
  '@/Components/InvitationCodes/InvitationCodeInvitationLinkButton',
  () => () => <div>InvitationCodeInvitationLinkButton</div>
);

jest.mock('@/Components/InvitationCodes/InvitationCodeAddButton', () => ({
  InvitationCodeAddButton: () => <button>Add Code</button>,
}));

jest.mock('@/Components/InvitationCodes/InvitationCodeDeleteButton', () => ({
  InvitationCodeDeleteButton: ({ id }: { id: number }) => (
    <button>Delete {id}</button>
  ),
}));

jest.mock('@/Components/Users/UserDeleteButton', () => ({
  UserDeleteButton: ({ user }: { user: UserMin }) => (
    <button>Delete {user.name}</button>
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

describe('InvitationCodesTable', () => {
  it('renders the table with invitation codes', () => {
    render(
      <InvitationCodesTable
        auth={{ user: mockUser }}
        invitationCodes={mockInvitationCodes}
      />
    );

    expect(screen.getByText('User & Einladungen')).toBeInTheDocument();
    expect(screen.getByText('CODE123')).toBeInTheDocument();
    expect(screen.getByText('CODE456')).toBeInTheDocument();
    expect(screen.getByText('CheckMark')).toBeInTheDocument(); // For unused code
    expect(screen.getByText('CrossMark')).toBeInTheDocument(); // For used code
  });

  it('shows the Add Code button if no unused code is available for the admin', () => {
    // Modify the invitation codes to simulate the condition where no unused code exists
    const noUnusedCodes = [
      {
        id: 2,
        code: 'CODE456',
        admin_id: 1,
        editor_id: 2,
        editor: { id: 2, name: 'Editor User', email: 'editor@example.com' },
        admin: { id: 1, name: 'Admin User', email: 'admin@example.com' },
      },
    ] as InvitationCode[];

    render(
      <InvitationCodesTable
        auth={{ user: mockUser }}
        invitationCodes={noUnusedCodes}
      />
    );

    expect(screen.getByText('Add Code')).toBeInTheDocument();
  });

  it('does not show the Add Code button if an unused code is available for the admin', () => {
    render(
      <InvitationCodesTable
        auth={{ user: mockUser }}
        invitationCodes={mockInvitationCodes}
      />
    );

    expect(screen.queryByText('Add Code')).toBeNull();
  });

  it('renders delete buttons for unused codes', () => {
    render(
      <InvitationCodesTable
        auth={{ user: mockUser }}
        invitationCodes={mockInvitationCodes}
      />
    );

    expect(screen.getByText('Delete 1')).toBeInTheDocument(); // Unused code
    expect(screen.queryByText('Delete 2')).toBeNull(); // Used code
  });

  it('renders InvitationCodeInvitationLinkButton buttons for unused codes', () => {
    render(
      <InvitationCodesTable
        auth={{ user: mockUser }}
        invitationCodes={mockInvitationCodes}
      />
    );

    expect(
      screen.getByText('InvitationCodeInvitationLinkButton')
    ).toBeInTheDocument(); // Unused code
    expect(screen.queryByText('-')).toBeNull(); // Used code
  });
});
