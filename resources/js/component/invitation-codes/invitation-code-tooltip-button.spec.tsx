import { infoMail } from '@/constants/email.const';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { InvitationCodeTooltipButton } from './invitation-code-tooltip-button';

describe('InvitationCodeTooltipButton', () => {
  test('renders InvitationCodeTooltipButton with tooltip content on hover', async () => {
    render(<InvitationCodeTooltipButton />);

    const iconButton = screen.getByRole('button');
    expect(iconButton).toBeInTheDocument();

    fireEvent.mouseOver(iconButton); // hover over the iconbutton to make tooltip appear

    // wait for tooltip to appear and check its content
    await waitFor(() => {
      const tooltipText = screen.getByText(/Einladungscode/i);
      expect(tooltipText).toBeInTheDocument();

      const emailLink = screen.getByText(infoMail);
      expect(emailLink).toBeInTheDocument();
      expect(emailLink).toHaveAttribute('href', `mailto:${infoMail}`);
    });
  });
});
