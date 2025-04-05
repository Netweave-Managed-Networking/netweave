import { ToastProps } from '@/Components/Util/Toast';
import { PageProps } from '@/types/page-props.type';
import { usePage } from '@inertiajs/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ServerToastProvider } from './ServerToastProvider';
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
            <span>{position?.toString()}</span>
            <button onClick={onClose}>Close</button>
          </div>
        )
      );
    }
);

const TestComponent = () => {
  return (
    <ToastProvider>
      <ServerToastProvider>
        <div></div>
      </ServerToastProvider>
    </ToastProvider>
  );
};

describe('ServerToastProvider', () => {
  const mockProps: Pick<PageProps, 'success_message' | 'error_message'> = {
    error_message: null,
    success_message: null,
  };

  beforeEach(() => {
    // Reset the mock props before each test
    (usePage as jest.Mock).mockReturnValue({ props: mockProps });
  });

  it('should not render the toast when there is no message', () => {
    render(<TestComponent />);
    expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
  });

  it('should render a success toast when there is a success message', async () => {
    mockProps.success_message = 'Operation successful!';
    render(<TestComponent />);

    expect(
      await screen.findByText('Operation successful!')
    ).toBeInTheDocument();
    expect(screen.getByText('success')).toBeInTheDocument();
    expect(
      screen.getByText({ v: 'bottom', h: 'right' }.toString())
    ).toBeInTheDocument();
  });

  it('should render an error toast when there is an error message', async () => {
    mockProps.error_message = 'An error occurred!';
    render(<TestComponent />);

    expect(await screen.findByText('An error occurred!')).toBeInTheDocument();
    expect(screen.getByText('error')).toBeInTheDocument();
    expect(
      screen.getByText({ v: 'bottom', h: 'right' }.toString())
    ).toBeInTheDocument();
  });

  it('should close the toast when the close button is clicked', async () => {
    mockProps.success_message = 'Operation successful!';
    render(<TestComponent />);

    const toast = await screen.findByTestId('toast');
    expect(toast).toBeInTheDocument();

    // Simulate close button click
    fireEvent.click(screen.getByText('Close'));

    await waitFor(() => {
      expect(toast).not.toBeInTheDocument();
    });
  });

  it('should reset success_message and error_message after closing the toast', async () => {
    mockProps.success_message = 'Operation successful!';
    render(<TestComponent />);

    expect(
      await screen.findByText('Operation successful!')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close'));

    await waitFor(() => {
      expect(mockProps.success_message).toBeNull();
      expect(mockProps.error_message).toBeNull();
    });
  });
});
