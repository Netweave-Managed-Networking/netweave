import InvitationCodesPage from '@/pages/invitation-codes/invitation-codes-page';
import { mockInvitationCodes } from '@/testing/mock-invitation-codes.mock';
import { mockUser } from '@/testing/mock-users.mock';
import { InvitationCode } from '@/types/invitation-code.model';
import { render, screen } from '@testing-library/react';

// Mocking child components used in InvitationCodesPage
jest.mock('@inertiajs/react', () => ({
  Head: ({ title }: { title: string }) => <title>{title}</title>,
}));

jest.mock('@/components/invitation-codes/invitation-codes-table', () => ({
  InvitationCodesTable: ({ showAddCodeButton }: { showAddCodeButton: boolean }) => (
    <>
      <div>InvitationCodesTableeeee</div>
      {showAddCodeButton ? <div>AddCodeButton</div> : ''}
    </>
  ),
}));

// Mock the AuthenticatedLayout
jest.mock('@/layouts/authenticated-layout', () => ({ children, header }: { children: React.ReactNode; header: React.ReactNode }) => (
  <div>
    {header} {children}
  </div>
));

describe('InvitationCodesPage', () => {
  it.only('renders page title', () => {
    render(<InvitationCodesPage auth={{ user: mockUser }} invitationCodes={mockInvitationCodes} />);

    expect(screen.getByText('User & Einladungen')).toBeInTheDocument();
  });

  it('renders InvitationCodesTable component', () => {
    render(<InvitationCodesPage auth={{ user: mockUser }} invitationCodes={mockInvitationCodes} />);

    expect(screen.getByText('InvitationCodesTable')).toBeInTheDocument();
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

    render(<InvitationCodesPage auth={{ user: mockUser }} invitationCodes={noUnusedCodes} />);

    expect(screen.getByText('AddCodeButton')).toBeInTheDocument();
  });

  it('does not show the Add Code button if showAddCodeButton is false', () => {
    render(<InvitationCodesPage auth={{ user: mockUser }} invitationCodes={mockInvitationCodes} />);

    expect(screen.queryByText('AddCodeButton')).toBeNull();
  });
});
