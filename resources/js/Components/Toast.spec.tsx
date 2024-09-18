import { fireEvent, render, screen } from '@testing-library/react';
import Toast from './Toast';

describe('Toast Component', () => {
  it('renders the Snackbar with the correct message', () => {
    render(<Toast open={true} message="Test message" />);

    // Check if the Snackbar contains the message
    const snackbar = screen.getByText('Test message');
    expect(snackbar).toBeInTheDocument();
  });

  it('does not render the Snackbar when open is false', () => {
    render(<Toast open={false} message="Test message" />);

    // Check that the Snackbar is not in the DOM
    const snackbar = screen.queryByText('Test message');
    expect(snackbar).not.toBeInTheDocument();
  });

  it('calls onClose when the Snackbar is closed', () => {
    const handleClose = jest.fn();
    render(<Toast open={true} message="Test message" onClose={handleClose} />);

    // Trigger the onClose event (this simulates the Snackbar auto-closing)
    fireEvent.keyDown(document, { key: 'Escape' }); // Simulate closing event
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders the Snackbar at top right', () => {
    render(<Toast open={true} message="Test message" position="top-right" />);

    const snackbar =
      screen.getByText('Test message').parentElement?.parentElement;
    expect(snackbar).toHaveClass('MuiSnackbar-anchorOriginTopRight');
  });

  it('renders the Snackbar at bottom center', () => {
    render(
      <Toast open={true} message="Test message" position="bottom-center" />
    );

    const snackbar =
      screen.getByText('Test message').parentElement?.parentElement;
    expect(snackbar).toHaveClass('MuiSnackbar-anchorOriginBottomCenter');
  });
});
