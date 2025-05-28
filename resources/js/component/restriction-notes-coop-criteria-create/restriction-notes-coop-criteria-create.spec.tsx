import { OrganizationNo } from '@/types/organization-no.model';
import { useForm } from '@inertiajs/react';
import { render, screen } from '@testing-library/react';
import { RestrictionNotesCoopCriteriaCreate } from './restriction-notes-coop-criteria-create';

jest.mock('@inertiajs/react', () => ({
  useForm: jest.fn(),
  route: jest.fn(() => '/mocked-route'),
}));

jest.mock('../coop-criteria/coop-criteria-input', () => ({
  CoopCriteriaInput: ({ onChange }: { onChange: (data: unknown) => void }) => (
    <input aria-label="Coop Criteria Input" onChange={(e) => onChange({ for_coop: e.target.value })} />
  ),
}));

jest.mock('../restrictions/restriction-input', () => ({
  RestrictionInput: ({ type, onChange }: { type: string; onChange: (data: unknown) => void }) => (
    <input aria-label={`${type} Restriction Input`} onChange={(e) => onChange({ description: e.target.value })} />
  ),
}));

jest.mock('../notes/notes-input', () => ({
  NotesInput: ({ onChange }: { onChange: (data: unknown) => void }) => (
    <input aria-label="Notes Input" onChange={(e) => onChange({ notes: e.target.value })} />
  ),
}));

describe('RestrictionNotesCoopCriteriaCreate', () => {
  const mockOrganization = {
    id: 1,
    notes: { notes: '' },
  } as OrganizationNo;

  const mockUseForm = {
    data: {},
    setData: jest.fn(),
    post: jest.fn(),
    errors: {},
    processing: false,
  };

  beforeEach(() => {
    (useForm as jest.Mock).mockReturnValue(mockUseForm);
  });

  it('renders all input fields and buttons', () => {
    render(<RestrictionNotesCoopCriteriaCreate organization={mockOrganization} />);

    expect(screen.getByLabelText('Coop Criteria Input')).toBeInTheDocument();
    expect(screen.getByLabelText('thematic Restriction Input')).toBeInTheDocument();
    expect(screen.getByLabelText('regional Restriction Input')).toBeInTheDocument();
    expect(screen.getByLabelText('Notes Input')).toBeInTheDocument();
    expect(screen.getByText('Fertig')).toBeInTheDocument();
    expect(screen.getByText('Zurück')).toBeInTheDocument();
  });
});
