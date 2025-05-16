import { storeResourceCategory } from '@/axios/storeResourceCategory.axios';
import { ResourceCategory } from '@/types/resource-category.model';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ResourceCategoryCreateModal, ResourceCategoryCreateModalProps } from './resource-category-create-modal';

jest.mock('@/axios/storeResourceCategory.axios');

const mockOnClose = jest.fn();

const defaultProps: ResourceCategoryCreateModalProps = {
  show: true,
  onClose: mockOnClose,
};

describe('ResourceCategoryCreateModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders input fields and buttons', () => {
    render(<ResourceCategoryCreateModal {...defaultProps} />);

    expect(screen.getByLabelText(/Titel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Definition/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Erstellen/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Abbrechen/i })).toBeInTheDocument();
  });

  test('disables submit button when title is empty', () => {
    render(<ResourceCategoryCreateModal {...defaultProps} />);
    const createButton = screen.getByRole('button', { name: /Erstellen/i });
    expect(createButton).toBeDisabled();
  });

  test('enables submit button when title is not empty', () => {
    render(<ResourceCategoryCreateModal {...defaultProps} />);
    const titleInput = screen.getByLabelText(/Titel/i) as HTMLInputElement;
    const createButton = screen.getByRole('button', { name: /Erstellen/i });

    fireEvent.change(titleInput, { target: { value: 'New Category' } });
    expect(createButton).not.toBeDisabled();
  });

  test('calls onClose with undefined when cancel button is clicked', () => {
    render(<ResourceCategoryCreateModal {...defaultProps} />);
    const cancelButton = screen.getByRole('button', { name: /Abbrechen/i });

    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalledWith(undefined);
  });

  test('submits the form successfully', async () => {
    const newCategory: ResourceCategory = { id: 1, title: 'New Category' };
    (storeResourceCategory as jest.Mock).mockResolvedValue(newCategory);

    render(<ResourceCategoryCreateModal {...defaultProps} />);
    const titleInput = screen.getByLabelText(/Titel/i) as HTMLInputElement;
    const createButton = screen.getByRole('button', { name: /Erstellen/i });

    fireEvent.change(titleInput, { target: { value: 'New Category' } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(storeResourceCategory).toHaveBeenCalledWith({
        title: 'New Category',
      });
      expect(mockOnClose).toHaveBeenCalledWith(newCategory);
    });
  });

  test('button is disabled when title is empty', async () => {
    render(<ResourceCategoryCreateModal {...defaultProps} />);
    const titleInput = screen.getByLabelText(/Titel/i) as HTMLInputElement;
    const createButton = screen.getByRole('button', { name: /Erstellen/i });

    // Type and then clear the input
    fireEvent.change(titleInput, { target: { value: 'Some Title' } });
    fireEvent.change(titleInput, { target: { value: '' } });

    // Now the button should be enabled, allowing the validation to trigger
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(createButton).toBeInTheDocument();
      expect(createButton).toBeDisabled();
    });
  });

  test('displays error messages from server response', async () => {
    (storeResourceCategory as jest.Mock).mockRejectedValue({
      response: { data: { errors: { title: 'Server validation error' } } },
    });

    render(<ResourceCategoryCreateModal {...defaultProps} />);
    const titleInput = screen.getByLabelText(/Titel/i) as HTMLInputElement;
    const createButton = screen.getByRole('button', { name: /Erstellen/i });

    fireEvent.change(titleInput, { target: { value: 'Invalid Title' } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/Server validation error/i)).toBeInTheDocument();
    });
  });

  test('capitalizes words in the name input', () => {
    render(<ResourceCategoryCreateModal {...defaultProps} />);
    const titleInput = screen.getByLabelText(/Titel/i) as HTMLInputElement;

    fireEvent.change(titleInput, { target: { value: 'category titel' } });
    expect(titleInput.value).toBe('Category Titel');
  });

  test('resets the form when modal is reopened', () => {
    const { rerender } = render(<ResourceCategoryCreateModal {...defaultProps} />);
    const titleInput = screen.getByLabelText(/Titel/i) as HTMLInputElement;

    // Change the input value
    fireEvent.change(titleInput, { target: { value: 'Some Title' } });
    expect(titleInput.value).toBe('Some Title');

    // Close and reopen the modal
    rerender(<ResourceCategoryCreateModal {...defaultProps} show={false} />);
    rerender(<ResourceCategoryCreateModal {...defaultProps} show={true} />);

    // Check if the input value is reset
    expect(titleInput.value).toBe('');
  });
});
