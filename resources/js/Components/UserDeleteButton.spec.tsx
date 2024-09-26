import { useForm } from '@inertiajs/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { UserDeleteButton } from './UserDeleteButton';

// Mock the `useForm` hook from Inertia.js
jest.mock('@inertiajs/react', () => ({
  useForm: jest.fn(),
}));

// Mock the `route` function
const route = jest.fn();

// Provide the `route` mock globally
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).route = route;

describe('UserDeleteButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call httpDelete with the correct route when the button is clicked', async () => {
    const id = 1;
    const mockDelete = jest.fn();
    (useForm as jest.Mock).mockReturnValue({ delete: mockDelete });

    render(<UserDeleteButton id={id} />);

    // Simulate button click
    fireEvent.click(screen.getByRole('button'));

    // Verify `route` was called with correct arguments
    expect(route).toHaveBeenCalledWith('users.destroy', id);

    // Verify `httpDelete` was called with the correct route URL
    expect(mockDelete).toHaveBeenCalledWith(
      route('registration-codes.destroy', id)
    );
  });
});
