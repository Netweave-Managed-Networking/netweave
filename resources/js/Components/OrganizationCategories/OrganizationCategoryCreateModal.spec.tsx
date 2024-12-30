import { storeOrganizationCategory } from '@/axios/storeOrganizationCategory.axios';
import { OrganizationCategory } from '@/types/organization-category.model';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  OrganizationCategoryCreateModal,
  OrganizationCategoryCreateModalProps,
} from './OrganizationCategoryCreateModal';

jest.mock('@/axios/storeOrganizationCategory.axios');

const mockOnClose = jest.fn();

const defaultProps: OrganizationCategoryCreateModalProps = {
  show: true,
  onClose: mockOnClose,
};

describe('OrganizationCategoryCreateModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders input fields and buttons', () => {
    render(<OrganizationCategoryCreateModal {...defaultProps} />);

    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Beschreibung/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Erstellen/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Abbrechen/i })
    ).toBeInTheDocument();
  });

  test('disables submit button when name is empty', () => {
    render(<OrganizationCategoryCreateModal {...defaultProps} />);
    const createButton = screen.getByRole('button', { name: /Erstellen/i });
    expect(createButton).toBeDisabled();
  });

  test('enables submit button when name is not empty', () => {
    render(<OrganizationCategoryCreateModal {...defaultProps} />);
    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    const createButton = screen.getByRole('button', { name: /Erstellen/i });

    fireEvent.change(nameInput, { target: { value: 'New Category' } });
    expect(createButton).not.toBeDisabled();
  });

  test('calls onClose with undefined when cancel button is clicked', () => {
    render(<OrganizationCategoryCreateModal {...defaultProps} />);
    const cancelButton = screen.getByRole('button', { name: /Abbrechen/i });

    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalledWith(undefined);
  });

  test('submits the form successfully', async () => {
    const newCategory: OrganizationCategory = { id: 1, name: 'New Category' };
    (storeOrganizationCategory as jest.Mock).mockResolvedValue(newCategory);

    render(<OrganizationCategoryCreateModal {...defaultProps} />);
    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    const createButton = screen.getByRole('button', { name: /Erstellen/i });

    fireEvent.change(nameInput, { target: { value: 'New Category' } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(storeOrganizationCategory).toHaveBeenCalledWith({
        name: 'New Category',
      });
      expect(mockOnClose).toHaveBeenCalledWith(newCategory);
    });
  });

  test('button is disabled when name is empty', async () => {
    render(<OrganizationCategoryCreateModal {...defaultProps} />);
    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    const createButton = screen.getByRole('button', { name: /Erstellen/i });

    // Type and then clear the input
    fireEvent.change(nameInput, { target: { value: 'Some Name' } });
    fireEvent.change(nameInput, { target: { value: '' } });

    // Now the button should be enabled, allowing the validation to trigger
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(createButton).toBeInTheDocument();
      expect(createButton).toBeDisabled();
    });
  });

  test('displays error messages from server response', async () => {
    (storeOrganizationCategory as jest.Mock).mockRejectedValue({
      response: { data: { errors: { name: 'Server validation error' } } },
    });

    render(<OrganizationCategoryCreateModal {...defaultProps} />);
    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    const createButton = screen.getByRole('button', { name: /Erstellen/i });

    fireEvent.change(nameInput, { target: { value: 'Invalid Name' } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/Server validation error/i)).toBeInTheDocument();
    });
  });

  test('capitalizes words in the name input', () => {
    render(<OrganizationCategoryCreateModal {...defaultProps} />);
    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'category name' } });
    expect(nameInput.value).toBe('Category Name');
  });
});
