import { fireEvent, render, screen } from '@testing-library/react';
import HeaderParagraphInfoModalButton, {
  HeaderParagraphInfoModalButtonProps,
} from './HeaderParagraphInfoModalButton';

const mockItems = [
  { header: 'Bananas', paragraph: 'Info about bananas.' },
  { header: 'Apples', paragraph: 'Info about apples.' },
  { header: 'Cherries', paragraph: 'Info about cherries.' },
];

const defaultProps: HeaderParagraphInfoModalButtonProps = {
  items: mockItems,
  modalTitle: 'Test Modal',
  infoButtonTooltip: 'Click for info',
};

describe('HeaderParagraphInfoModalButton', () => {
  it('renders the button with a tooltip', async () => {
    render(<HeaderParagraphInfoModalButton {...defaultProps} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    fireEvent.mouseOver(button);
    const tooltipText = await screen.findByText(defaultProps.infoButtonTooltip);
    expect(tooltipText).toBeInTheDocument();
  });

  it('renders items in alphabetical order by header', () => {
    render(<HeaderParagraphInfoModalButton {...defaultProps} />);

    // Simulate clicking the info button to open the modal
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Ensure the modal is open by checking for the modal title
    const modalTitle = screen.getByText(defaultProps.modalTitle);
    expect(modalTitle).toBeInTheDocument();

    // Find all header elements in the modal
    const headerElements = screen.getAllByRole('heading', { level: 2 });

    // Get the expected sorted headers
    const sortedHeaders = mockItems
      .sort((a, b) => a.header.localeCompare(b.header))
      .map(item => item.header);

    // Assert the headers are displayed in the correct order
    sortedHeaders.forEach((header, index) => {
      expect(headerElements[index]).toHaveTextContent(header);
    });
  });

  it('displays items correctly in the modal', () => {
    render(<HeaderParagraphInfoModalButton {...defaultProps} />);
    const button = screen.getByRole('button');
    fireEvent.click(button); // Open modal

    mockItems
      .sort((a, b) => a.header.localeCompare(b.header))
      .forEach(item => {
        const headerElement = screen.getByText(item.header);
        const paragraphElement = screen.getByText(item.paragraph);
        expect(headerElement).toBeInTheDocument();
        expect(paragraphElement).toBeInTheDocument();
      });
  });
});
