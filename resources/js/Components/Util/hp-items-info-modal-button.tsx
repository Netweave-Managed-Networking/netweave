import { letters } from '@/constants/alphabet';
import { useState } from 'react';
import HoverInfoButton from './hover-info-button';
import Modal from './modal';

export interface HPItemsInfoModalButtonProps {
  items: { header: string; paragraph?: string }[];
  modalTitle: string;
  infoButtonTooltip: string;
}

export default function HPItemsInfoModalButton({
  items,
  modalTitle,
  infoButtonTooltip,
}: HPItemsInfoModalButtonProps) {
  const itemsWithLetters: ({ header: string; paragraph?: string } | string)[] =
    [...items, ...letters.map(l => l.toUpperCase())].sort((a, b) => {
      const aStr = typeof a === 'string' ? a : a.header;
      const bStr = typeof b === 'string' ? b : b.header;
      return aStr.localeCompare(bStr);
    });

  const [modalIsActive, setModalIsActive] = useState<boolean>(false);
  const showModal = () => setModalIsActive(true);
  const hideModal = () => setModalIsActive(false);

  return (
    <>
      <HoverInfoButton message={infoButtonTooltip} onClick={showModal} />

      <Modal show={modalIsActive} onClose={hideModal}>
        <div className="px-6 pb-6 overflow-y-auto" style={{ height: '90vh' }}>
          <h1 className="text-2xl py-6 font-medium sticky top-0 bg-white">
            {modalTitle}
          </h1>

          <div className="space-y-6">
            {itemsWithLetters.map(item => (
              <div key={typeof item === 'string' ? item : item.header}>
                {typeof item === 'string' && (
                  <span className="text-purple-900">{item}</span>
                )}
                {!(typeof item === 'string') && (
                  <div style={{ paddingLeft: '1em' }}>
                    <h2 className="text-xl text-green-950">{item.header}</h2>
                    <p className="text-gray-800">{item.paragraph}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
