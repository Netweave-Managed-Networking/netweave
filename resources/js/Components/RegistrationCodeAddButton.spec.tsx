import { fireEvent, render, screen } from '@testing-library/react';
import { RegistrationCodeAddButton } from './RegistrationCodeAddButton';

// Mock Inertia.js `useForm`
const mockPost = jest.fn();
jest.mock('@inertiajs/react', () => ({ useForm: () => ({ post: mockPost }) }));

describe('RegistrationCodeAddButton', () => {
  beforeEach(() => {
    mockPost.mockClear(); // Clear mock calls before each test
  });

  it('renders the button and triggers post request on click', () => {
    render(<RegistrationCodeAddButton />);

    // Find the button
    const button = screen.getByRole('button');

    // Simulate button click
    fireEvent.click(button);

    // Assert post request is called
    expect(mockPost).toHaveBeenCalledWith('/registration-codes');
  });
});
