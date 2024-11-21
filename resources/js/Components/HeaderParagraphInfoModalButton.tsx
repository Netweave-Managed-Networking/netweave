import { letters } from '@/constants/alphabet';
import InfoIcon from '@mui/icons-material/Info';
import { IconButton, Tooltip } from '@mui/material';
import { useState } from 'react';
import Modal from './Modal';

export interface HeaderParagraphInfoModalButtonProps {
  items: { header: string; paragraph: string }[];
  modalTitle: string;
  infoButtonTooltip: string;
}

export default function HeaderParagraphInfoModalButton({
  items,
  modalTitle,
  infoButtonTooltip,
}: HeaderParagraphInfoModalButtonProps) {
  items = [
    ...items,
    ...letters.map(l => ({ header: l.toUpperCase(), paragraph: '' })),
  ].sort((a, b) => a.header.localeCompare(b.header));

  const [modalIsActive, setModalIsActive] = useState<boolean>(false);
  const showModal = () => setModalIsActive(true);
  const hideModal = () => setModalIsActive(false);

  return (
    <>
      <Tooltip title={infoButtonTooltip} placement="top">
        <IconButton onClick={showModal} sx={{ padding: 0 }}>
          <InfoIcon className="text-gray-800" />
        </IconButton>
      </Tooltip>

      <Modal show={modalIsActive} onClose={hideModal}>
        <div className="px-6 pb-6 overflow-y-auto" style={{ height: '90vh' }}>
          <h1 className="text-2xl py-6 font-medium sticky top-0 bg-white">
            {modalTitle}
          </h1>

          <div className="space-y-6">
            {items.map(item => (
              <div key={item.header}>
                <h2 className="text-xl">{item.header}</h2>
                <p className="text-gray-800">{item.paragraph}</p>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
