/* eslint-disable react/display-name */
import { copyToClipboard } from '@/helpers/copyToClipboard.helper';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ToastProps } from '../Util/Toast';
import InvitationCodeInvitationLinkButton from './InvitationCodeInvitationLinkButton';

// Mock the copyToClipboard helper function
jest.mock('@/helpers/copyToClipboard.helper', () => ({
  copyToClipboard: jest.fn(),
}));

// Mock the Toast component since it's part of the UI but not essential for testing logic
jest.mock('@/Components/Util/Toast', () => (props: ToastProps) => {
  return props.open ? <div data-testid="toast">{props.message}</div> : null;
});

describe('InvitationCodeInvitationLinkButton', () => {
  const invitationCode = 'sampleCode123';

  it('renders the button and tooltip', async () => {
    render(<InvitationCodeInvitationLinkButton code={invitationCode} />);

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
    render(<InvitationCodeInvitationLinkButton code={invitationCode} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Verify that copyToClipboard was called with the correct link
    expect(copyToClipboard).toHaveBeenCalledWith(
      `${window.location.origin}/register?code=${invitationCode}`
    );
  });

  it('shows the toast message after clicking the button', () => {
    render(<InvitationCodeInvitationLinkButton code={invitationCode} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Verify that the toast message appears after the button click
    const toastMessage = screen.getByTestId('toast');
    expect(toastMessage).toHaveTextContent(
      'Der Einladungslink wurde in die Zwischenablage kopiert.'
    );
  });
});
