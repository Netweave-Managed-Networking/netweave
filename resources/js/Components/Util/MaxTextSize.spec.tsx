import { render } from '@testing-library/react';
import { MaxTextSize } from './MaxTextSize';

describe('MaxTextSize', () => {
  it('renders the correct byte size and max value when byte size is within limit', () => {
    const { getByText } = render(<MaxTextSize value="test" max={10} />);
    expect(getByText('4/10')).toBeInTheDocument();
  });

  it('renders the correct byte size and max value when byte size exceeds limit', () => {
    const { getByText } = render(<MaxTextSize value="exceeding" max={5} />);
    expect(getByText('9/5')).toBeInTheDocument();
  });

  it('renders the correct byte size and max value when string contains umlauts', () => {
    const str = 'ääööüü';
    const { getByText } = render(<MaxTextSize value={str} max={5} />);
    expect(getByText(`${new Blob([str]).size}/5`)).toBeInTheDocument();
  });

  it('applies the correct class when byte size is within limit', () => {
    const { container } = render(<MaxTextSize value="test" max={10} />);
    expect(container.querySelector('span')?.className).toContain('font-medium text-gray-700');
  });

  it('applies the correct class when byte size exceeds limit', () => {
    const { container } = render(<MaxTextSize value="exceeding" max={5} />);
    expect(container.querySelector('span')?.className).toContain('font-extrabold text-red-800');
  });

  it('does not render anything when value is undefined', () => {
    const { container } = render(<MaxTextSize value={undefined} max={10} />);
    expect(container.firstChild).toBeNull();
  });

  it('does not render anything when value is an empty string', () => {
    const { container } = render(<MaxTextSize value="" max={10} />);
    expect(container.firstChild).toBeNull();
  });
});
