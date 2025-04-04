import { useForm } from '@inertiajs/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { OrganizationCategoryUpdateButton } from './OrganizationCategoryUpdateButton';

// Mocking dependencies
jest.mock('@inertiajs/react', () => ({
  useForm: jest.fn(),
}));

// Mock the `route` function
const route = jest.fn();
// Provide the `route` mock globally
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).route = route;

jest.mock('@/Components/Input/PrimaryButton', () => (props: any) => (
  <button {...props} data-testid="primary-button">
    {props.children}
  </button>
));

jest.mock('@/Components/Input/SecondaryButton', () => (props: any) => (
  <button {...props} data-testid="secondary-button">
    {props.children}
  </button>
));

jest.mock('@mui/icons-material/EditOutlined', () => () => (
  <div data-testid="edit-icon"></div>
));

jest.mock('@/Components/Util/Modal', () => (props: any) => (
  <div data-testid="modal">{props.show && <div>{props.children}</div>}</div>
));

describe('OrganizationCategoryUpdateButton', () => {
  const mockCategory = {
    id: 1,
    name: 'Category Name',
    description: 'Category Description',
  };
  const mockPut = jest.fn();

  beforeEach(() => {
    (useForm as jest.Mock).mockReturnValue({
      data: { name: mockCategory.name, description: mockCategory.description },
      setData: jest.fn(),
      put: mockPut,
      errors: {},
      processing: false,
    });
  });

  it('renders the update button with the EditOutlined icon', () => {
    render(<OrganizationCategoryUpdateButton category={mockCategory} />);

    const iconButton = screen.getByRole('button');
    expect(iconButton).toBeInTheDocument();

    const icon = screen.getByTestId('edit-icon');
    expect(icon).toBeInTheDocument();
  });

  it('opens the modal when the update button is clicked', () => {
    render(<OrganizationCategoryUpdateButton category={mockCategory} />);

    const iconButton = screen.getByRole('button');
    fireEvent.click(iconButton);

    const modal = screen.getByTestId('modal');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveTextContent('Organisationskategorie bearbeiten');
  });

  it('closes the modal when the cancel button is clicked', async () => {
    render(<OrganizationCategoryUpdateButton category={mockCategory} />);

    fireEvent.click(screen.getByRole('button'));

    const cancelButton = screen.getByTestId('secondary-button');
    fireEvent.click(cancelButton);

    await waitFor(() =>
      expect(screen.queryByTestId('modal')).not.toHaveTextContent(
        'Kategorie bearbeiten'
      )
    );
  });

  it('calls the put function when the save button is clicked', async () => {
    render(<OrganizationCategoryUpdateButton category={mockCategory} />);

    fireEvent.click(screen.getByRole('button')); // Open modal
    const saveButton = screen.getByTestId('primary-button');
    fireEvent.click(saveButton); // Confirm save

    await waitFor(() => expect(mockPut).toHaveBeenCalled());
  });

  it('disables the save button while processing', async () => {
    (useForm as jest.Mock).mockReturnValue({
      data: { name: mockCategory.name, description: mockCategory.description },
      setData: jest.fn(),
      put: mockPut,
      errors: {},
      processing: true,
    });

    render(<OrganizationCategoryUpdateButton category={mockCategory} />);

    fireEvent.click(screen.getByRole('button')); // Open modal

    const saveButton = screen.getByTestId('primary-button');
    expect(saveButton).toBeDisabled();
  });
});
