import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import InputLabel from './InputLabel';

describe('InputLabel Component', () => {
  it('renders the value prop when provided', () => {
    render(<InputLabel value="Test Label" />);
    const labelElement = screen.getByText('Test Label');
    expect(labelElement).toBeInTheDocument();
  });

  it('renders children when the value prop is not provided', () => {
    render(<InputLabel>Child Label</InputLabel>);
    const labelElement = screen.getByText('Child Label');
    expect(labelElement).toBeInTheDocument();
  });

  it('renders the required asterisk when the required prop is true', () => {
    render(<InputLabel required />);
    const asteriskElement = screen.getByText('*');
    expect(asteriskElement).toBeInTheDocument();
    expect(asteriskElement).toHaveClass('text-red-700');
  });

  it('does not render the required asterisk when the required prop is false', () => {
    render(<InputLabel />);
    const asteriskElement = screen.queryByText('*');
    expect(asteriskElement).not.toBeInTheDocument();
  });

  it('applies the additional className to the label', () => {
    render(<InputLabel className="custom-class" value="Test Label" />);
    const labelElement = screen.getByText('Test Label');
    expect(labelElement).toHaveClass(
      'block font-medium text-sm text-gray-700 custom-class'
    );
  });

  it('applies other props correctly to the label', () => {
    render(
      <InputLabel value="Test Label" id="test-id" data-testid="custom-label" />
    );
    const labelElement = screen.getByTestId('custom-label');
    expect(labelElement).toHaveAttribute('id', 'test-id');
  });

  it('renders the correct structure', () => {
    const { container } = render(<InputLabel value="Test Label" required />);
    const wrapperDiv = container.querySelector('div.flex');
    const label = container.querySelector('label');
    const asterisk = container.querySelector('span');

    expect(wrapperDiv).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(asterisk).toBeInTheDocument();
    expect(label).toHaveTextContent('Test Label');
    expect(asterisk).toHaveTextContent('*');
  });
});
