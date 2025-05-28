import { letters } from '@/constants/alphabet';
import { fireEvent, render, screen } from '@testing-library/react';
import HPItemsInfoModalButton, { HPItemsInfoModalButtonProps } from './hp-items-info-modal-button';

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
    const button = screen.getByRole('button');
    fireEvent.click(button); // Open modal

    const sortedItems = [...mockItems, ...letters.map((l) => ({ header: l.toUpperCase(), paragraph: '' }))].sort((a, b) =>
      a.header.localeCompare(b.header),
    );

    sortedItems.forEach((item) => {
      const headerElement = screen.getByText(item.header);
      expect(headerElement).toBeInTheDocument();
    });
  });

  it('displays items correctly in the modal', () => {
    render(<HPItemsInfoModalButton {...defaultProps} />);
    const button = screen.getByRole('button');
    fireEvent.click(button); // Open modal

    mockItems
      .sort((a, b) => a.header.localeCompare(b.header))
      .forEach((item) => {
        const headerElement = screen.getByText(item.header);
        const paragraphElement = screen.getByText(item.paragraph);
        expect(headerElement).toBeInTheDocument();
        expect(paragraphElement).toBeInTheDocument();
      });
  });
});
