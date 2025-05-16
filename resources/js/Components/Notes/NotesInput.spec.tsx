import { emptyNotes, notesMax } from '@/types/notes-create.model';
import { fireEvent, render, screen } from '@testing-library/react';
import { NotesInput } from './NotesInput';

describe('NotesInput', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders the input label and textarea', () => {
    render(<NotesInput onChange={mockOnChange} errors={{ notes: '' }} autoFocus={false} />);

    expect(screen.getByLabelText('Notizen zum Wesen / Charakter der Organisation')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('calls onChange with updated data and pristine status when input changes', () => {
    render(<NotesInput onChange={mockOnChange} errors={{ notes: '' }} autoFocus={false} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New note' } });

    expect(mockOnChange).toHaveBeenCalledWith({ ...emptyNotes, notes: 'New note' }, false);
  });

  it('shows an error message when errors are passed', () => {
    render(<NotesInput onChange={mockOnChange} errors={{ notes: 'This field is required.' }} autoFocus={false} />);

    expect(screen.getByText('This field is required.')).toBeInTheDocument();
  });

  it('displays the max text size indicator correctly', () => {
    render(<NotesInput onChange={mockOnChange} errors={{ notes: '' }} autoFocus={false} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test note' } });

    expect(screen.getByText(new RegExp(`${'Test note'.length}(\s|\n)*/(\s|\n)*${notesMax.notes}`))).toBeInTheDocument();
  });

  it('handles edge case: empty input', () => {
    render(<NotesInput onChange={mockOnChange} errors={{ notes: '' }} autoFocus={false} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: '' } });

    expect(mockOnChange).toHaveBeenCalledWith(emptyNotes, true);
  });

  it('handles edge case: input exceeding max length', () => {
    const longText = 'a'.repeat(notesMax.notes + 1);

    render(<NotesInput onChange={mockOnChange} errors={{ notes: '' }} autoFocus={false} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: longText } });

    expect(mockOnChange).toHaveBeenCalledWith({ ...emptyNotes, notes: longText }, false);
    expect(screen.getByText(new RegExp(`${longText.length}(\s|\n)*/(\s|\n)*${notesMax.notes}`))).toBeInTheDocument();
  });
});
