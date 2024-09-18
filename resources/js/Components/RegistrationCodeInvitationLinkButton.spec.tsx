/* eslint-disable react/display-name */
import { copyToClipboard } from '@/helpers/copyToClipboard';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import RegistrationCodeInvitationLinkButton from './RegistrationCodeInvitationLinkButton';
import { ToastProps } from './Toast';

// Mock the copyToClipboard helper function
jest.mock('@/helpers/copyToClipboard', () => ({
  copyToClipboard: jest.fn(),
}));

// Mock the Toast component since it's part of the UI but not essential for testing logic
jest.mock('@/Components/Toast', () => (props: ToastProps) => {
  return props.open ? <div data-testid="toast">{props.message}</div> : null;
});

describe('RegistrationCodeInvitationLinkButton', () => {
  const registrationCode = 'sampleCode123';

  it('renders the button and tooltip', async () => {
    render(<RegistrationCodeInvitationLinkButton code={registrationCode} />);

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
    render(<RegistrationCodeInvitationLinkButton code={registrationCode} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Verify that copyToClipboard was called with the correct link
    expect(copyToClipboard).toHaveBeenCalledWith(
      `${window.location.origin}/register?code=${registrationCode}`
    );
  });

  it('shows the toast message after clicking the button', () => {
    render(<RegistrationCodeInvitationLinkButton code={registrationCode} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Verify that the toast message appears after the button click
    const toastMessage = screen.getByTestId('toast');
    expect(toastMessage).toHaveTextContent(
      'Der Einladungslink wurde in die Zwischenablage kopiert.'
    );
  });
});
