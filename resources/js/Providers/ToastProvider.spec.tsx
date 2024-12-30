/* eslint-disable react/display-name */
import { ToastProps } from '@/Components/Util/Toast';
import { usePage } from '@inertiajs/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from './ToastProvider';

// Mocking the usePage hook from Inertia.js
jest.mock('@inertiajs/react', () => ({
  usePage: jest.fn(),
}));

// Mocking the Toast component
jest.mock(
  '@/Components/Util/Toast',
  () =>
    ({ open, message, onClose, severity, position }: ToastProps) => {
      return (
        open && (
          <div data-testid="toast" role="alert">
            <p>{message}</p>
            <span>{severity}</span>
            <span>{position}</span>
            <button onClick={onClose}>Close</button>
          </div>
        )
      );
    }
);

describe('ToastProvider', () => {
  const mockProps: {
    props: {
      success_message: string | undefined | null;
      error_message: string | undefined | null;
    };
  } = {
    props: {
      success_message: null,
      error_message: null,
    },
  };

  beforeEach(() => {
    // Reset the mock props before each test
    (usePage as jest.Mock).mockReturnValue(mockProps);
  });

  it('should not render the toast when there is no message', () => {
    render(<ToastProvider />);
    expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
  });

  it('should render a success toast when there is a success message', async () => {
    mockProps.props.success_message = 'Operation successful!';
    render(<ToastProvider />);

    expect(
      await screen.findByText('Operation successful!')
    ).toBeInTheDocument();
    expect(screen.getByText('success')).toBeInTheDocument();
    expect(screen.getByText('bottom-right')).toBeInTheDocument();
  });

  it('should render an error toast when there is an error message', async () => {
    mockProps.props.error_message = 'An error occurred!';
    render(<ToastProvider />);

    expect(await screen.findByText('An error occurred!')).toBeInTheDocument();
    expect(screen.getByText('error')).toBeInTheDocument();
    expect(screen.getByText('bottom-right')).toBeInTheDocument();
  });

  it('should close the toast when the close button is clicked', async () => {
    mockProps.props.success_message = 'Operation successful!';
    render(<ToastProvider />);

    const toast = await screen.findByTestId('toast');
    expect(toast).toBeInTheDocument();

    // Simulate close button click
    userEvent.click(screen.getByText('Close'));

    await waitFor(() => {
      expect(toast).not.toBeInTheDocument();
    });
  });

  it('should reset success_message and error_message after closing the toast', async () => {
    mockProps.props.success_message = 'Operation successful!';
    render(<ToastProvider />);

    expect(
      await screen.findByText('Operation successful!')
    ).toBeInTheDocument();

    userEvent.click(screen.getByText('Close'));

    await waitFor(() => {
      expect(mockProps.props.success_message).toBeNull();
      expect(mockProps.props.error_message).toBeNull();
    });
  });
});
