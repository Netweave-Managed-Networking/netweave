import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HoverInfoButton from './HoverInfoButton';

describe('HoverInfoButton', () => {
  it('renders the InfoIcon', () => {
    render(<HoverInfoButton message="Test message" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays the tooltip with the correct message on hover', async () => {
    render(<HoverInfoButton message="Test message" />);
    const button = screen.getByRole('button');
    await userEvent.hover(button);
    expect(await screen.findByText('Test message')).toBeInTheDocument();
  });

  it('renders the InfoIcon when clickable', () => {
    render(<HoverInfoButton message="Clickable message" onClick={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.querySelector('svg')).toHaveClass('MuiSvgIcon-root');
  });

  it('renders the HelpOutlineIcon when not clickable', () => {
    render(<HoverInfoButton message="Non-clickable message" />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.querySelector('svg')).toHaveClass('MuiSvgIcon-root');
  });

  it('calls the onClick handler when clickable and clicked', async () => {
    const handleClick = jest.fn();
    render(<HoverInfoButton message="Clickable message" onClick={handleClick} />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when not clickable', async () => {
    const handleClick = jest.fn();
    render(<HoverInfoButton message="Non-clickable message" />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
