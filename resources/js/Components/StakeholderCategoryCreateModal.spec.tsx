import { storeStakeholderCategory } from '@/axios/storeStakeholderCategory.axios';
import { StakeholderCategory } from '@/types/stakeholder-category.model';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  StakeholderCategoryCreateModal,
  StakeholderCategoryCreateModalProps,
} from './StakeholderCategoryCreateModal';

jest.mock('@/axios/storeStakeholderCategory.axios');

const mockOnClose = jest.fn();

const defaultProps: StakeholderCategoryCreateModalProps = {
  show: true,
  onClose: mockOnClose,
};

describe('StakeholderCategoryCreateModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders input fields and buttons', () => {
    render(<StakeholderCategoryCreateModal {...defaultProps} />);

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
    render(<StakeholderCategoryCreateModal {...defaultProps} />);
    const createButton = screen.getByRole('button', { name: /Erstellen/i });
    expect(createButton).toBeDisabled();
  });

  test('enables submit button when name is not empty', () => {
    render(<StakeholderCategoryCreateModal {...defaultProps} />);
    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    const createButton = screen.getByRole('button', { name: /Erstellen/i });

    fireEvent.change(nameInput, { target: { value: 'New Category' } });
    expect(createButton).not.toBeDisabled();
  });

  test('calls onClose with undefined when cancel button is clicked', () => {
    render(<StakeholderCategoryCreateModal {...defaultProps} />);
    const cancelButton = screen.getByRole('button', { name: /Abbrechen/i });

    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalledWith(undefined);
  });

  test('submits the form successfully', async () => {
    const newCategory: StakeholderCategory = { id: 1, name: 'New Category' };
    (storeStakeholderCategory as jest.Mock).mockResolvedValue(newCategory);

    render(<StakeholderCategoryCreateModal {...defaultProps} />);
    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    const createButton = screen.getByRole('button', { name: /Erstellen/i });

    fireEvent.change(nameInput, { target: { value: 'New Category' } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(storeStakeholderCategory).toHaveBeenCalledWith({
        name: 'New Category',
      });
      expect(mockOnClose).toHaveBeenCalledWith(newCategory);
    });
  });

  test('button is disabled when name is empty', async () => {
    render(<StakeholderCategoryCreateModal {...defaultProps} />);
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
    (storeStakeholderCategory as jest.Mock).mockRejectedValue({
      response: { data: { errors: { name: 'Server validation error' } } },
    });

    render(<StakeholderCategoryCreateModal {...defaultProps} />);
    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
    const createButton = screen.getByRole('button', { name: /Erstellen/i });

    fireEvent.change(nameInput, { target: { value: 'Invalid Name' } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/Server validation error/i)).toBeInTheDocument();
    });
  });

  test('capitalizes words in the name input', () => {
    render(<StakeholderCategoryCreateModal {...defaultProps} />);
    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'category name' } });
    expect(nameInput.value).toBe('Category Name');
  });
});
