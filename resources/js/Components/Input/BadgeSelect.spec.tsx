import { fireEvent, render, screen } from '@testing-library/react';
import BadgeSelect, { BadgeSelectProps } from './BadgeSelect';

describe('BadgeSelect component', () => {
  const mockElements = [
    { id: 1, label: 'Badge 1', isActivated: false },
    { id: 2, label: 'Badge 2', isActivated: true },
    { id: 3, label: 'Badge 3', isActivated: false },
  ];

  const onChangeMock = jest.fn();

  const renderComponent = (props: Partial<BadgeSelectProps> = {}) => {
    return render(
      <BadgeSelect elements={mockElements} onChange={onChangeMock} {...props} />
    );
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders badges correctly', () => {
    renderComponent();

    // Verify each badge by label
    mockElements.forEach(element => {
      expect(screen.getByText(element.label)).toBeInTheDocument();
    });
  });

  it('calls onChange with initially activated elements', () => {
    renderComponent();

    // Initial onChange call with only activated element(s)
    expect(onChangeMock).toHaveBeenCalledWith([2]);
  });

  it('toggles an element and calls onChange', () => {
    renderComponent();

    const badge1 = screen.getByText('Badge 1');

    // Toggle Badge 1
    fireEvent.click(badge1);
    expect(onChangeMock).toHaveBeenCalledWith([1, 2]);

    // Toggle Badge 2 off
    const badge2 = screen.getByText('Badge 2');
    fireEvent.click(badge2);
    expect(onChangeMock).toHaveBeenCalledWith([1]);
  });

  it('renders an add button if add prop is provided', () => {
    const addMock = { onAdd: jest.fn(), label: 'Add Badge' };

    renderComponent({ add: addMock });

    const addButton = screen.getByText(addMock.label);
    expect(addButton).toBeInTheDocument();
  });

  it('calls add onAdd function when add button is clicked', () => {
    const addMock = { onAdd: jest.fn(), label: 'Add Badge' };

    renderComponent({ add: addMock });

    const addButton = screen.getByText(addMock.label);
    fireEvent.click(addButton);
    expect(addMock.onAdd).toHaveBeenCalled();
  });

  it('sorts badges alphabetically', () => {
    const unsortedElements = [
      { id: 1, label: 'Charlie', isActivated: false },
      { id: 2, label: 'Bravo', isActivated: false },
      { id: 3, label: 'Alpha', isActivated: false },
    ];

    renderComponent({ elements: unsortedElements });

    const badges = screen
      .getAllByText(/Alpha|Bravo|Charlie/)
      .map(el => el.textContent);
    expect(badges).toEqual(['Alpha', 'Bravo', 'Charlie']);
  });
});
