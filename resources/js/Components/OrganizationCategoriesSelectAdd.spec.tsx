import { OrganizationCategoryMin } from '@/types/organization-category-min.model';
import { fireEvent, render, screen } from '@testing-library/react';
import OrganizationCategoriesSelectAdd from './OrganizationCategoriesSelectAdd';
import { OrganizationCategoryCreateModalProps } from './OrganizationCategoryCreateModal';

jest.mock('./OrganizationCategoryCreateModal', () => ({
  __esModule: true,
  OrganizationCategoryCreateModal: ({
    show,
    onClose,
  }: OrganizationCategoryCreateModalProps) => {
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

describe('OrganizationCategoriesSelectAdd', () => {
  const mockCategories = [
    { id: 1, name: 'Category 1' },
    { id: 2, name: 'Category 2' },
  ] as OrganizationCategoryMin[];

  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders the component with headline "Kategorien"', () => {
    render(
      <OrganizationCategoriesSelectAdd
        organizationCategories={[]}
        organizationCategoriesErrors={undefined}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Kategorien')).toBeInTheDocument();
  });

  it('renders the component with initial categories', () => {
    render(
      <OrganizationCategoriesSelectAdd
        organizationCategories={mockCategories}
        organizationCategoriesErrors={undefined}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Category 1')).toBeInTheDocument();
    expect(screen.getByText('Category 2')).toBeInTheDocument();
  });

  it('displays the error message when provided', () => {
    render(
      <OrganizationCategoriesSelectAdd
        organizationCategories={mockCategories}
        organizationCategoriesErrors="An error occurred"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('An error occurred')).toBeInTheDocument();
  });

  it('opens and closes the modal when "Neue Kategorie" is clicked and closed', () => {
    const textInsideModal = 'Submit inside Modal';

    render(
      <OrganizationCategoriesSelectAdd
        organizationCategories={mockCategories}
        organizationCategoriesErrors={undefined}
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
      <OrganizationCategoriesSelectAdd
        organizationCategories={mockCategories}
        organizationCategoriesErrors={undefined}
        onChange={mockOnChange}
      />
    );

    fireEvent.click(screen.getByText('Category 1'));
    expect(mockOnChange).toHaveBeenCalledWith([1]);
  });

  it('adds a new category when the modal is submitted', () => {
    render(
      <OrganizationCategoriesSelectAdd
        organizationCategories={mockCategories}
        organizationCategoriesErrors={undefined}
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
