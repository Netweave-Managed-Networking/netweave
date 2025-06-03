import { mockOrganizationCategories } from '@/testing/mock-organization-categories.mock';
import { fireEvent, render, screen } from '@testing-library/react';
import OrganizationCategoriesSelectAdd from './organization-categories-select-add';
import { OrganizationCategoryCreateModalProps } from './organization-category-create-modal';

let id = 200;
const name = (id: number) => `Category ${id}`;

jest.mock('./organization-category-create-modal', () => ({
  __esModule: true,
  OrganizationCategoryCreateModal: ({ show, onClose }: OrganizationCategoryCreateModalProps) => {
    if (!show) return null;
    return (
      <div role="dialog">
        <button
          onClick={() => {
            id++;
            return onClose({
              ...mockOrganizationCategories[0],
              id,
              name: name(id),
            });
          }}
        >
          Submit inside Modal
        </button>
        <button onClick={() => onClose(undefined)}>Close inside Modal</button>
      </div>
    );
  },
}));

describe('OrganizationCategoriesSelectAdd', () => {
  const mockCategories = mockOrganizationCategories;

  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders the component with initial categories', () => {
    render(<OrganizationCategoriesSelectAdd organizationCategories={mockCategories} organizationCategoriesSelected={[]} onChange={mockOnChange} />);

    expect(screen.getByText(mockCategories[0].name)).toBeInTheDocument();
    expect(screen.getByText(mockCategories[1].name)).toBeInTheDocument();
  });

  it('opens and closes the modal when "Neue Kategorie" is clicked and closed', () => {
    const textInsideModal = 'Submit inside Modal';

    render(<OrganizationCategoriesSelectAdd organizationCategories={mockCategories} organizationCategoriesSelected={[]} onChange={mockOnChange} />);

    // confirm modal not yet opened
    expect(screen.queryByText(textInsideModal)).not.toBeInTheDocument();

    // Open the modal
    fireEvent.click(screen.getByText('Neue Kategorie'));
    expect(screen.getByText(textInsideModal)).toBeInTheDocument();

    // Close the modal
    fireEvent.click(screen.getByRole('button', { name: /close inside Modal/i }));
    expect(screen.queryByText(textInsideModal)).not.toBeInTheDocument();
  });

  it('calls onChange when badges are changed', () => {
    render(<OrganizationCategoriesSelectAdd organizationCategories={mockCategories} organizationCategoriesSelected={[]} onChange={mockOnChange} />);

    fireEvent.click(screen.getByText(mockCategories[0].name));
    expect(mockOnChange).toHaveBeenCalledWith([mockCategories[0].id]);
  });

  it('adds a new category when the modal is submitted', () => {
    render(<OrganizationCategoriesSelectAdd organizationCategories={mockCategories} organizationCategoriesSelected={[]} onChange={mockOnChange} />);

    // Open the modal
    fireEvent.click(screen.getByText('Neue Kategorie'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Simulate adding a new category
    fireEvent.click(screen.getByText('Submit inside Modal'));

    // Check that the new badge is rendered
    expect(screen.getByText(mockCategories[0].name)).toBeInTheDocument();
  });

  it('adds two new categories when the modal is submitted twice', () => {
    render(<OrganizationCategoriesSelectAdd organizationCategories={mockCategories} organizationCategoriesSelected={[]} onChange={mockOnChange} />);

    // Open the modal
    fireEvent.click(screen.getByText('Neue Kategorie'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Simulate adding a new category
    fireEvent.click(screen.getByText('Submit inside Modal'));

    // Open the modal
    fireEvent.click(screen.getByText('Neue Kategorie'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Simulate adding a new category
    fireEvent.click(screen.getByText('Submit inside Modal'));

    // Check that the new badge is rendered
    expect(screen.getByText('Category 201')).toBeInTheDocument();
    expect(screen.getByText('Category 202')).toBeInTheDocument();
  });

  it('renders the AddButton', () => {
    render(<OrganizationCategoriesSelectAdd organizationCategories={mockCategories} organizationCategoriesSelected={[]} onChange={mockOnChange} />);

    const addButton = screen.getByText('Neue Kategorie');
    expect(addButton).toBeInTheDocument();
  });
});
