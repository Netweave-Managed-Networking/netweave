import { isEqual } from '@/helpers/is-equal.array.helper';
import { IdLabel } from '@/types/id-label.model';
import AddIcon from '@mui/icons-material/Add';
import { Chip } from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';
import BadgeSelect from './badge-select';

export interface SelectAddProps<Item extends { id: number }> {
  items: Item[];
  itemsSelected: Item['id'][];
  itemToIdLabel: (item: Item) => IdLabel;
  addSelectableButtonLabel: string;
  CreateItemModalComponent: ({ show, onClose }: { show: boolean; onClose: (newSelectable: Item | undefined) => void }) => ReactNode;
  onChange: (selectablesSelected: Item['id'][]) => void;
  className?: string;
}

export default function SelectAdd<Item extends { id: number }>({
  items,
  itemsSelected,
  itemToIdLabel,
  addSelectableButtonLabel,
  CreateItemModalComponent: createItemModalComponent,
  onChange,
  className = '',
}: SelectAddProps<Item>) {
  const [modalIsActive, setModalIsActive] = useState<boolean>(false);
  const showModal = () => setModalIsActive(true);
  const hideModal = () => setModalIsActive(false);

  const [selectablesSelected, setSelectablesSelected] = useState<IdLabel['id'][]>(itemsSelected);
  const [selectables, setSelectables] = useState<IdLabel[]>(items.map(itemToIdLabel));

  useEffect(() => {
    if (!isEqual(itemsSelected, selectablesSelected)) setSelectablesSelected(itemsSelected);
  }, [itemsSelected, selectablesSelected]);

  const updateAndOutput = (newSelectable: IdLabel['id'][]) => {
    setSelectablesSelected(newSelectable);
    onChange(newSelectable);
  };

  const addItemToSelectable = (newItem: Item | undefined) => {
    if (newItem) {
      items.push(newItem);
      const newSelectable = { ...itemToIdLabel(newItem), isActivated: true };
      setSelectables([...selectables, newSelectable]);
      updateAndOutput([...selectablesSelected, newSelectable.id]);
    }
    hideModal();
  };

  const addSelectableButton: JSX.Element = (
    <Chip
      icon={<AddIcon />}
      label={addSelectableButtonLabel}
      onClick={() => showModal()}
      sx={{
        backgroundColor: 'grey.300',
        '&:hover': { backgroundColor: 'grey.400' },
      }}
    />
  );

  return (
    <div className={className} style={{ marginTop: '4px' }}>
      <BadgeSelect elements={selectables} value={selectablesSelected} onChange={updateAndOutput} elemAppended={addSelectableButton} />

      {createItemModalComponent({
        show: modalIsActive,
        onClose: addItemToSelectable,
      })}
    </div>
  );
}
