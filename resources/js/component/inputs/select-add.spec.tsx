import { IdLabel } from '@/types/id-label.model';
import { fireEvent, render, screen } from '@testing-library/react';
import SelectAdd, { SelectAddProps } from './select-add';

interface TestItem {
  id: number;
  label: string;
}

const items: TestItem[] = [
  { id: 1, label: 'Item 1' },
  { id: 2, label: 'Item 2' },
];

const itemToIdLabel = (item: TestItem): IdLabel => ({
  id: item.id,
  label: item.label,
});

const createItemModalComponent = ({ show, onClose }: { show: boolean; onClose: (newSelectable: TestItem | undefined) => void }) => {
  if (!show) return null;
  return (
    <div>
      <button onClick={() => onClose({ id: 3, label: 'Item 3' })}>Add Item 3</button>
      <button onClick={() => onClose(undefined)}>Cancel</button>
    </div>
  );
};

const defaultProps: SelectAddProps<TestItem> = {
  items,
  itemsSelected: [],
  itemToIdLabel,
  addSelectableButtonLabel: 'Add Item',
  CreateItemModalComponent: createItemModalComponent,
  onChange: jest.fn(),
};

describe('SelectAdd Component', () => {
  it('renders without crashing', () => {
    render(<SelectAdd {...defaultProps} />);
    expect(screen.getByText('Add Item')).toBeInTheDocument();
  });

  it('opens modal on add button click', () => {
    render(<SelectAdd {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));
    expect(screen.getByText('Add Item 3')).toBeInTheDocument();
  });

  it('adds new item to selectables', () => {
    const onChange = jest.fn();
    render(<SelectAdd {...defaultProps} onChange={onChange} />);
    fireEvent.click(screen.getByText('Add Item'));
    fireEvent.click(screen.getByText('Add Item 3'));
    expect(onChange).toHaveBeenCalledWith([3]);
  });

  it('cancels adding new item', () => {
    render(<SelectAdd {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Item'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Add Item 3')).not.toBeInTheDocument();
  });
});
