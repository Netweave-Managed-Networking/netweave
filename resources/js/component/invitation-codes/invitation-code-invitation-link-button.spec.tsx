import { copyToClipboard } from '@/helpers/copy-to-clipboard.helper';
import { ToastProvider } from '@/providers/toast-provider';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ToastProps } from '../utils/toasts';
import InvitationCodeInvitationLinkButton from './invitation-code-invitation-link-button';

// Mock the copyToClipboard helper function
jest.mock('@/helpers/copy-to-clipboard.helper', () => ({
  copyToClipboard: jest.fn(),
}));

// Mock the Toast component since it's part of the UI but not essential for testing logic
jest.mock('@/component/utils/toasts', () => (props: ToastProps) => {
  return props.open ? <div data-testid="toast">{props.message}</div> : null;
});

describe('InvitationCodeInvitationLinkButton', () => {
  const invitationCode = 'sampleCode123';

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(<ToastProvider>{ui}</ToastProvider>);
  };

  it('renders the button and tooltip', async () => {
    renderWithProviders(<InvitationCodeInvitationLinkButton code={invitationCode} />);

    // Check if the copy button is in the document
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    // Check if the tooltip text is in the document
    fireEvent.mouseOver(button);
    await waitFor(() => {
      expect(screen.getByText('Einladungslink kopieren')).toBeInTheDocument();
    });
  });

  it('copies the invitation link to the clipboard on button click', () => {
    renderWithProviders(<InvitationCodeInvitationLinkButton code={invitationCode} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Verify that copyToClipboard was called with the correct link
    expect(copyToClipboard).toHaveBeenCalledWith(`${window.location.origin}/register?code=${invitationCode}`);
  });

  it('shows the toast message after clicking the button', () => {
    renderWithProviders(<InvitationCodeInvitationLinkButton code={invitationCode} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Verify that the toast message appears after the button click
    const toastMessage = screen.getByTestId('toast');
    expect(toastMessage).toHaveTextContent('Der Einladungslink wurde in die Zwischenablage kopiert.');
  });
});
