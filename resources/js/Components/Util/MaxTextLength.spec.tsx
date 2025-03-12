import { render } from '@testing-library/react';
import { MaxTextLength } from './MaxTextLength';

describe('MaxTextLength', () => {
  it('renders the correct length and max value when length is within limit', () => {
    const { getByText } = render(<MaxTextLength value="test" max={10} />);
    expect(getByText('4/10')).toBeInTheDocument();
  });

  it('renders the correct length and max value when length exceeds limit', () => {
    const { getByText } = render(<MaxTextLength value="exceeding" max={5} />);
    expect(getByText('9/5')).toBeInTheDocument();
  });

  it('applies the correct class when length is within limit', () => {
    const { container } = render(<MaxTextLength value="test" max={10} />);
    expect(container.querySelector('span')?.className).toContain(
      'font-medium text-gray-700'
    );
  });

  it('applies the correct class when length exceeds limit', () => {
    const { container } = render(<MaxTextLength value="exceeding" max={5} />);
    expect(container.querySelector('span')?.className).toContain(
      'font-extrabold text-red-800'
    );
  });

  it('does not render anything when value is undefined', () => {
    const { container } = render(<MaxTextLength value={undefined} max={10} />);
    expect(container.firstChild).toBeNull();
  });

  it('does not render anything when value is an empty string', () => {
    const { container } = render(<MaxTextLength value="" max={10} />);
    expect(container.firstChild).toBeNull();
  });
});
