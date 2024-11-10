import { StakeholderCategoryMin } from '@/types/stakeholder-category-min.model';
import { fireEvent, render, screen } from '@testing-library/react';
import StakeholderCategoriesSelectAdd from './StakeholderCategoriesSelectAdd';
import { StakeholderCategoryCreateModalProps } from './StakeholderCategoryCreateModal';

jest.mock('./StakeholderCategoryCreateModal', () => ({
  __esModule: true,
  StakeholderCategoryCreateModal: ({
    show,
    onClose,
  }: StakeholderCategoryCreateModalProps) => {
    if (!show) return null;
    return (
      <div role="dialog">
        <button onClick={() => onClose({ id: 3, name: 'Category 3' })}>
          Submit inside Modal
        </button>
        <button onClick={() => onClose(undefined)}>Close inside Modal</button>
      </div>
    );
  },
}));

describe('StakeholderCategoriesSelectAdd', () => {
  const mockCategories = [
    { id: 1, name: 'Category 1' },
    { id: 2, name: 'Category 2' },
  ] as StakeholderCategoryMin[];

  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders the component with headline "Kategorien"', () => {
    render(
      <StakeholderCategoriesSelectAdd
        stakeholderCategories={[]}
        stakeholderCategoriesErrors={undefined}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Kategorien')).toBeInTheDocument();
  });

  it('renders the component with initial categories', () => {
    render(
      <StakeholderCategoriesSelectAdd
        stakeholderCategories={mockCategories}
        stakeholderCategoriesErrors={undefined}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Category 1')).toBeInTheDocument();
    expect(screen.getByText('Category 2')).toBeInTheDocument();
  });

  it('displays the error message when provided', () => {
    render(
      <StakeholderCategoriesSelectAdd
        stakeholderCategories={mockCategories}
        stakeholderCategoriesErrors="An error occurred"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('An error occurred')).toBeInTheDocument();
  });

  it('opens and closes the modal when "Neue Kategorie" is clicked and closed', () => {
    const textInsideModal = 'Submit inside Modal';

    render(
      <StakeholderCategoriesSelectAdd
        stakeholderCategories={mockCategories}
        stakeholderCategoriesErrors={undefined}
        onChange={mockOnChange}
      />
    );

    // confirm modal not yet opened
    expect(screen.queryByText(textInsideModal)).not.toBeInTheDocument();

    // Open the modal
    fireEvent.click(screen.getByText('Neue Kategorie'));
    expect(screen.getByText(textInsideModal)).toBeInTheDocument();

    // Close the modal
    fireEvent.click(
      screen.getByRole('button', { name: /close inside Modal/i })
    );
    expect(screen.queryByText(textInsideModal)).not.toBeInTheDocument();
  });

  it('calls onChange when badges are changed', () => {
    render(
      <StakeholderCategoriesSelectAdd
        stakeholderCategories={mockCategories}
        stakeholderCategoriesErrors={undefined}
        onChange={mockOnChange}
      />
    );

    fireEvent.click(screen.getByText('Category 1'));
    expect(mockOnChange).toHaveBeenCalledWith([1]);
  });

  it('adds a new category when the modal is submitted', () => {
    render(
      <StakeholderCategoriesSelectAdd
        stakeholderCategories={mockCategories}
        stakeholderCategoriesErrors={undefined}
        onChange={mockOnChange}
      />
    );

    // Open the modal
    fireEvent.click(screen.getByText('Neue Kategorie'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Simulate adding a new category
    fireEvent.click(screen.getByText('Submit inside Modal'));

    // Check that the new badge is rendered
    expect(screen.getByText('Category 3')).toBeInTheDocument();
  });
});
