import { useForm } from '@inertiajs/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { UserDeleteButton } from '../Users/UserDeleteButton';

// Mocking dependencies
jest.mock('@inertiajs/react', () => ({
  useForm: jest.fn(),
}));

// Mock the `route` function
const route = jest.fn();
// Provide the `route` mock globally
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).route = route;

jest.mock('@/Components/Input/DangerButton', () => (props: any) => (
  <button {...props} data-testid="danger-button">
    {props.children}
  </button>
));

jest.mock('@/Components/Input/SecondaryButton', () => (props: any) => (
  <button {...props} data-testid="secondary-button">
    {props.children}
  </button>
));

jest.mock('@mui/icons-material/PersonRemove', () => () => (
  <div data-testid="person-remove-icon"></div>
));

jest.mock('@/Components/Util/Modal', () => (props: any) => (
  <div data-testid="modal">{props.show && <div>{props.children}</div>}</div>
));

describe('UserDeleteButton', () => {
  const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
  const mockDelete = jest.fn();

  beforeEach(() => {
    (useForm as jest.Mock).mockReturnValue({
      delete: mockDelete,
    });
  });

  it('renders the delete button with the PersonRemoveIcon', () => {
    render(<UserDeleteButton user={mockUser} />);

    const iconButton = screen.getByRole('button');
    expect(iconButton).toBeInTheDocument();

    const icon = screen.getByTestId('person-remove-icon');
    expect(icon).toBeInTheDocument();
  });

  it('opens the modal when the delete button is clicked', () => {
    render(<UserDeleteButton user={mockUser} />);

    const iconButton = screen.getByRole('button');
    fireEvent.click(iconButton);

    const modal = screen.getByTestId('modal');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveTextContent('Bist du sicher?');
  });

  it('closes the modal when the cancel button is clicked', async () => {
    render(<UserDeleteButton user={mockUser} />);

    fireEvent.click(screen.getByRole('button'));

    const cancelButton = screen.getByTestId('secondary-button');
    fireEvent.click(cancelButton);

    await waitFor(() =>
      expect(screen.queryByTestId('modal')).not.toHaveTextContent(
        'Bist du sicher?'
      )
    );
  });

  it('calls the delete function when the confirm button is clicked', async () => {
    render(<UserDeleteButton user={mockUser} />);

    fireEvent.click(screen.getByRole('button')); // Open modal
    const deleteButton = screen.getByTestId('danger-button');
    fireEvent.click(deleteButton); // Confirm delete

    await waitFor(() => expect(mockDelete).toHaveBeenCalled());
  });

  it('disables the delete button while loading', async () => {
    render(<UserDeleteButton user={mockUser} />);

    fireEvent.click(screen.getByRole('button')); // Open modal

    fireEvent.click(screen.getByTestId('danger-button')); // Confirm delete

    await waitFor(() =>
      expect(screen.getByTestId('danger-button')).toBeDisabled()
    );
  });
});
