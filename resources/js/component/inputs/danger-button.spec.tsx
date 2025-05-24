import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DangerButton from './danger-button';

describe('DangerButton', () => {
  it('renders the button with the provided children', () => {
    render(<DangerButton>Delete</DangerButton>);
    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toBeInTheDocument();
  });

  it('applies the correct default styles', () => {
    render(<DangerButton>Delete</DangerButton>);
    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toHaveClass(
      'inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-500 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150'
    );
  });

  it('renders with custom className', () => {
    render(<DangerButton className="custom-class">Delete</DangerButton>);
    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toHaveClass('custom-class');
  });

  it('disables the button when disabled prop is true', () => {
    render(<DangerButton disabled>Delete</DangerButton>);
    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-25');
  });

  it('calls onClick when button is clicked', async () => {
    const handleClick = jest.fn();
    render(<DangerButton onClick={handleClick}>Delete</DangerButton>);
    const button = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when button is disabled', async () => {
    const handleClick = jest.fn();
    render(
      <DangerButton disabled onClick={handleClick}>
        Delete
      </DangerButton>
    );
    const button = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
