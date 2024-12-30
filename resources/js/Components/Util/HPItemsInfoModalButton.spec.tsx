import { letters } from '@/constants/alphabet';
import { fireEvent, render, screen } from '@testing-library/react';
import HPItemsInfoModalButton, {
  HPItemsInfoModalButtonProps,
} from './HPItemsInfoModalButton';

const mockItems = [
  { header: 'Bananas', paragraph: 'Info about bananas.' },
  { header: 'Apples', paragraph: 'Info about apples.' },
  { header: 'Cherries', paragraph: 'Info about cherries.' },
];

const defaultProps: HPItemsInfoModalButtonProps = {
  items: mockItems,
  modalTitle: 'Test Modal',
  infoButtonTooltip: 'Click for info',
};

describe('HPItemsInfoModalButton', () => {
  it('renders the button with a tooltip', async () => {
    render(<HPItemsInfoModalButton {...defaultProps} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    fireEvent.mouseOver(button);
    const tooltipText = await screen.findByText(defaultProps.infoButtonTooltip);
    expect(tooltipText).toBeInTheDocument();
  });

  it('renders items in alphabetical order with alphabet by header', () => {
    render(<HPItemsInfoModalButton {...defaultProps} />);

    // Simulate clicking the info button to open the modal
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Ensure the modal is open by checking for the modal title
    const modalTitle = screen.getByText(defaultProps.modalTitle);
    expect(modalTitle).toBeInTheDocument();

    // Find all header elements in the modal
    const headerElements = screen.getAllByRole('heading', { level: 2 });

    // Get the expected sorted headers
    const sortedHeaders = [
      ...mockItems,
      ...letters.map(l => ({ header: l, paragraph: '' })),
    ]
      .sort((a, b) => a.header.localeCompare(b.header))
      .map(item => item.header);

    // Assert the headers are displayed in the correct order (case insensitive)
    sortedHeaders.forEach((header, index) => {
      expect(headerElements[index]).toHaveTextContent(
        new RegExp(`^${header}$`, 'i')
      );
    });
  });

  it('displays items correctly in the modal', () => {
    render(<HPItemsInfoModalButton {...defaultProps} />);
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
