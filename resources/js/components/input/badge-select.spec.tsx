import { IdLabel } from '@/types/id-label.model';
import { fireEvent, render, screen } from '@testing-library/react';
import BadgeSelect, { BadgeSelectProps } from './badge-select';

describe('BadgeSelect component', () => {
  const onChangeMock = jest.fn();

  let mockElements: IdLabel[] = [
    { id: 1, label: 'Badge 1' },
    { id: 2, label: 'Badge 2' },
    { id: 3, label: 'Badge 3' },
  ];

  let mockSelected: IdLabel['id'][] = [2];

  const renderComponent = (props: Partial<BadgeSelectProps> = {}) => {
    return render(<BadgeSelect elements={mockElements} value={mockSelected} onChange={onChangeMock} {...props} />);
  };

  beforeEach(() => {
    mockElements = [
      { id: 1, label: 'Badge 1' },
      { id: 2, label: 'Badge 2' },
      { id: 3, label: 'Badge 3' },
    ];
    mockSelected = [2];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders badges correctly', () => {
    renderComponent();

    // Verify each badge by label
    mockElements.forEach((element) => {
      expect(screen.getByText(element.label)).toBeInTheDocument();
    });
  });

  it('toggles an element and calls onChange', () => {
    renderComponent();

    const badge1 = screen.getByText('Badge 1');

    // Toggle Badge 1
    fireEvent.click(badge1);
    expect(onChangeMock).toHaveBeenCalledWith([2, 1]);

    // Toggle Badge 2 off
    const badge2 = screen.getByText('Badge 2');
    fireEvent.click(badge2);
    expect(onChangeMock).toHaveBeenCalledWith([1]);
  });

  it('renders an appended element if provided', () => {
    const appendedElement = <button>Add Badge</button>;

    renderComponent({ elemAppended: appendedElement });

    const addButton = screen.getByText('Add Badge');
    expect(addButton).toBeInTheDocument();
  });

  it('sorts badges alphabetically', () => {
    const unsortedElements = [
      { id: 1, label: 'Charlie' },
      { id: 2, label: 'Bravo' },
      { id: 3, label: 'Alpha' },
    ];

    renderComponent({ elements: unsortedElements });

    const badges = screen.getAllByText(/Alpha|Bravo|Charlie/).map((el) => el.textContent);
    expect(badges).toEqual(['Alpha', 'Bravo', 'Charlie']);
  });

  it('does not call onChange with initially activated elements', () => {
    renderComponent();

    // Initial onChange call with only activated element(s)
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it('does not call onChange when value is changed from outside', () => {
    const { rerender } = renderComponent();

    // Update mockSelected and re-render
    mockSelected = [1, 3];
    rerender(<BadgeSelect elements={mockElements} value={mockSelected} onChange={onChangeMock} />);

    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it('reflects changes in selection when value is changed from outside', () => {
    const { rerender } = renderComponent();

    // Initial render with mockSelected = [2]
    expect(getParent('Badge 1')).not.toHaveClass('BadgeChipActivated');
    expect(getParent('Badge 2')).toHaveClass('BadgeChipActivated');
    expect(getParent('Badge 3')).not.toHaveClass('BadgeChipActivated');

    // Update mockSelected and re-render
    mockSelected = [1, 3];
    rerender(<BadgeSelect elements={mockElements} value={mockSelected} onChange={onChangeMock} />);

    // Verify the badges are updated
    expect(getParent('Badge 1')).toHaveClass('BadgeChipActivated');
    expect(getParent('Badge 2')).not.toHaveClass('BadgeChipActivated');
    expect(getParent('Badge 3')).toHaveClass('BadgeChipActivated');
  });
});

const getParent = (badge: string) => screen.getByText(badge).parentElement;
