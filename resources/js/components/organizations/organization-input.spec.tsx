import { emptyOrganizationMin, orgMinMax } from '@/types/organization-create-min.model';
import { fireEvent, render, screen } from '@testing-library/react';
import { OrganizationInput } from './organization-input';

describe('OrganizationInput', () => {
  const mockOnChange = jest.fn();

  const defaultProps = {
    onChange: mockOnChange,
    errors: {
      name: '',
      email: '',
      phone: '',
      postcode_city: '',
      street_hnr: '',
    },
    isNameRequired: true,
    autoFocus: false,
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all input fields', () => {
    render(<OrganizationInput {...defaultProps} />);
    expect(screen.getByLabelText(/Name der Organisation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email der Organisation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Telefonnummer der Organisation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/PLZ und Stadt der Organisation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Straße und Hausnummer der Organisation/i)).toBeInTheDocument();
  });

  it('calls onChange with updated data when input changes', () => {
    render(<OrganizationInput {...defaultProps} />);
    const nameInput = screen.getByLabelText(/Name der Organisation/i);
    fireEvent.change(nameInput, { target: { value: 'New Organization' } });
    expect(mockOnChange).toHaveBeenCalledWith({ ...emptyOrganizationMin, name: 'New Organization' }, false);
  });

  it('validates email format', () => {
    render(<OrganizationInput {...defaultProps} />);
    const emailInput = screen.getByLabelText(/Email der Organisation/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    expect(mockOnChange).toHaveBeenCalledWith({ ...emptyOrganizationMin, email: 'invalid-email' }, false);
  });

  it('enforces maximum text size for inputs', () => {
    render(<OrganizationInput {...defaultProps} />);
    const nameInput = screen.getByLabelText(/Name der Organisation/i);
    const longText = 'a'.repeat(orgMinMax.name + 1);
    fireEvent.change(nameInput, { target: { value: longText } });
    expect(mockOnChange).toHaveBeenCalledWith({ ...emptyOrganizationMin, name: longText }, false);
  });

  it('handles empty inputs correctly', () => {
    render(<OrganizationInput {...defaultProps} />);
    const nameInput = screen.getByLabelText(/Name der Organisation/i);
    fireEvent.change(nameInput, { target: { value: '' } });
    expect(mockOnChange).toHaveBeenCalledWith(emptyOrganizationMin, true);
  });

  it('displays error messages for invalid inputs', () => {
    const errors = {
      name: 'Name is required',
      email: 'Invalid email format',
      phone: '',
      postcode_city: '',
      street_hnr: '',
    };
    render(<OrganizationInput {...defaultProps} errors={errors} />);
    expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
  });
});
