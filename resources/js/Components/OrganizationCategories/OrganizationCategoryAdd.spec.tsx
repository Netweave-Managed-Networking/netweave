import { fireEvent, render, screen } from '@testing-library/react';
import OrganizationCategoryAdd from './OrganizationCategoryAdd';
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

describe('OrganizationCategoryAdd', () => {
  const mockOnOrganizationCategoryAdd = jest.fn();

  beforeEach(() => {
    mockOnOrganizationCategoryAdd.mockClear();
  });

  it('renders the add button with the AddOutlined icon', () => {
    render(
      <OrganizationCategoryAdd
        onOrganizationCategoryAdd={mockOnOrganizationCategoryAdd}
      />
    );

    const addButton = screen.getByRole('button');
    expect(addButton).toBeInTheDocument();

    const icon = screen.getByTestId('AddOutlinedIcon');
    expect(icon).toBeInTheDocument();
  });

  it('opens and closes the modal when the add button is clicked and closed', () => {
    const textInsideModal = 'Submit inside Modal';

    render(
      <OrganizationCategoryAdd
        onOrganizationCategoryAdd={mockOnOrganizationCategoryAdd}
      />
    );

    // confirm modal not yet opened
    expect(screen.queryByText(textInsideModal)).not.toBeInTheDocument();

    // Open the modal
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText(textInsideModal)).toBeInTheDocument();

    // Close the modal
    fireEvent.click(
      screen.getByRole('button', { name: /close inside Modal/i })
    );
    expect(screen.queryByText(textInsideModal)).not.toBeInTheDocument();
  });

  it('calls onOrganizationCategoryAdd when the modal is submitted', () => {
    render(
      <OrganizationCategoryAdd
        onOrganizationCategoryAdd={mockOnOrganizationCategoryAdd}
      />
    );

    // Open the modal
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Simulate adding a new category
    fireEvent.click(screen.getByText('Submit inside Modal'));

    // Check that the onOrganizationCategoryAdd function is called
    expect(mockOnOrganizationCategoryAdd).toHaveBeenCalledWith({
      id: 3,
      name: 'Category 3',
    });
  });

  it('does not call onOrganizationCategoryAdd when the modal is closed without submitting', () => {
    render(
      <OrganizationCategoryAdd
        onOrganizationCategoryAdd={mockOnOrganizationCategoryAdd}
      />
    );

    // Open the modal
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Close the modal without submitting
    fireEvent.click(screen.getByText('Close inside Modal'));

    // Check that the onOrganizationCategoryAdd function is not called
    expect(mockOnOrganizationCategoryAdd).not.toHaveBeenCalled();
  });
});
