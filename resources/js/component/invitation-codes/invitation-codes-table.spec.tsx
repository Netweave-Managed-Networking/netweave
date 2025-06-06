import { mockInvitationCodes } from '@/testing/mock-invitation-codes.mock';
import { InvitationCode } from '@/types/invitation-code.model';
import { UserMin } from '@/types/user-min.model';
import { render, screen } from '@testing-library/react';
import { InvitationCodesTable } from './invitation-codes-table';

// Mocking child components used in InvitationCodesPage
jest.mock('@/component/icon/check-mark', () => () => <div>CheckMark</div>);

jest.mock('@/component/icon/cross-mark', () => () => <div>CrossMark</div>);

jest.mock('@/component/invitation-codes/invitation-code-invitation-link-button', () => () => <div>InvitationCodeInvitationLinkButton</div>);

jest.mock('@/component/invitation-codes/invitation-code-add-button', () => ({
  InvitationCodeAddButton: () => <button>Add Code</button>,
}));

jest.mock('@/component/invitation-codes/invitation-code-delete-button', () => ({
  InvitationCodeDeleteButton: ({ id }: { id: number }) => <button>Delete {id}</button>,
}));

jest.mock('@/component/users/user-delete-button', () => ({
  UserDeleteButton: ({ user }: { user: UserMin }) => <button>Delete {user.name}</button>,
}));

describe('InvitationCodesPage', () => {
  it('renders the table with invitation codes', () => {
    render(<InvitationCodesTable showAddCodeButton={true} invitationCodes={mockInvitationCodes} />);

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

    render(<InvitationCodesTable showAddCodeButton={true} invitationCodes={noUnusedCodes} />);

    expect(screen.getByText('Add Code')).toBeInTheDocument();
  });

  it('does not show the Add Code button if showAddCodeButton is false', () => {
    render(<InvitationCodesTable showAddCodeButton={false} invitationCodes={mockInvitationCodes} />);

    expect(screen.queryByText('Add Code')).toBeNull();
  });

  it('renders delete buttons for unused codes', () => {
    render(<InvitationCodesTable showAddCodeButton={true} invitationCodes={mockInvitationCodes} />);

    expect(screen.getByText('Delete 1')).toBeInTheDocument(); // Unused code
    expect(screen.queryByText('Delete 2')).toBeNull(); // Used code
  });

  it('renders InvitationCodeInvitationLinkButton buttons for unused codes', () => {
    render(<InvitationCodesTable showAddCodeButton={true} invitationCodes={mockInvitationCodes} />);

    expect(screen.getByText('InvitationCodeInvitationLinkButton')).toBeInTheDocument(); // Unused code
    expect(screen.queryByText('-')).toBeNull(); // Used code
  });
});
