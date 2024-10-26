import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import BadgeSelect from './BadgeSelect';

describe('BadgeSelect Component', () => {
  const elements = [
    { id: 1, label: 'Element A' },
    { id: 2, label: 'Element B' },
    { id: 3, label: 'Element C' },
  ];
  let onChangeMock: jest.Mock;

  beforeEach(() => {
    onChangeMock = jest.fn();
  });

  it('should render without crashing', () => {
    render(<BadgeSelect elements={elements} onChange={onChangeMock} />);
    elements.forEach(element => {
      expect(screen.getByText(element.label)).toBeInTheDocument();
    });
  });

  it('should sort elements alphabetically', () => {
    const unorderedElements = [
      { id: 3, label: 'Element C' },
      { id: 1, label: 'Element A' },
      { id: 2, label: 'Element B' },
    ];
    render(
      <BadgeSelect elements={unorderedElements} onChange={onChangeMock} />
    );
    const chips = screen.getAllByRole('button');

    // Verify order is alphabetical: A, B, C
    expect(chips[0]).toHaveTextContent('Element A');
    expect(chips[1]).toHaveTextContent('Element B');
    expect(chips[2]).toHaveTextContent('Element C');
  });

  it('should toggle selection state when a badge is clicked', () => {
    render(<BadgeSelect elements={elements} onChange={onChangeMock} />);

    const elementA = screen.getByText('Element A');
    const elementB = screen.getByText('Element B');

    // Click to select Element A
    fireEvent.click(elementA);
    expect(elementA).toHaveStyle('background-color: grey.900');
    expect(onChangeMock).toHaveBeenCalledWith([1]);

    // Click to select Element B
    fireEvent.click(elementB);
    expect(elementB).toHaveStyle('background-color: grey.900');
    expect(onChangeMock).toHaveBeenCalledWith([1, 2]);

    // Click again to deselect Element A
    fireEvent.click(elementA);
    expect(elementA).toHaveStyle('background-color: grey.300');
    expect(onChangeMock).toHaveBeenCalledWith([2]);
  });

  it('should apply the correct styles for selected and unselected badges', () => {
    render(<BadgeSelect elements={elements} onChange={onChangeMock} />);

    const elemA = screen.getByText('Element A');
    const elemB = screen.getByText('Element B');

    // Access the parent node that has the applied styles from MUI
    const elemAStyle = window.getComputedStyle(elemA.parentElement!);
    const elementBStyle = window.getComputedStyle(elemB.parentElement!);

    // Initially, both should be unselected
    expect(elemAStyle.backgroundColor).toBe('rgb(238, 238, 238)'); // grey.300
    expect(elemAStyle.color).toBe('black'); // black
    expect(elementBStyle.backgroundColor).toBe('rgb(238, 238, 238)'); // grey.300
    expect(elementBStyle.color).toBe('black'); // black

    // Click to select Element A
    fireEvent.click(elemA);
    const updatedElementAStyle = window.getComputedStyle(elemA.parentElement!);
    expect(updatedElementAStyle.backgroundColor).toBe('rgb(66, 66, 66)'); // grey.900
    expect(updatedElementAStyle.color).toBe('white'); // white
  });

  it('should handle an empty elements array without errors', () => {
    render(<BadgeSelect elements={[]} onChange={onChangeMock} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('should call onChange with the correct values when badges are toggled', () => {
    render(<BadgeSelect elements={elements} onChange={onChangeMock} />);

    // Select Element A
    fireEvent.click(screen.getByText('Element A'));
    expect(onChangeMock).toHaveBeenCalledWith([1]);

    // Select Element C
    fireEvent.click(screen.getByText('Element C'));
    expect(onChangeMock).toHaveBeenCalledWith([1, 3]);

    // Deselect Element A
    fireEvent.click(screen.getByText('Element A'));
    expect(onChangeMock).toHaveBeenCalledWith([3]);
  });

  it('should apply the custom className if provided', () => {
    const customClassName = 'custom-class';
    const { container } = render(
      <BadgeSelect
        elements={elements}
        onChange={onChangeMock}
        className={customClassName}
      />
    );
    expect(container.getElementsByClassName(customClassName)).toHaveLength(1);
  });

  it('should trigger hover styles on badge hover', () => {
    render(<BadgeSelect elements={elements} onChange={onChangeMock} />);
    const elementA = screen.getByText('Element A');

    // Simulate hover
    fireEvent.mouseOver(elementA);
    expect(elementA).toHaveStyle('background-color: grey.200');

    // Click to select Element A, then simulate hover
    fireEvent.click(elementA);
    fireEvent.mouseOver(elementA);
    expect(elementA).toHaveStyle('background-color: grey.800');
  });
});
