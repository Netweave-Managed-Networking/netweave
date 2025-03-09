import { idTitleToIdLabel } from '@/helpers/idTitleToIdLabel.helper';
import { isEqual } from '@/helpers/isEqual.array.helper';
import { IdLabel } from '@/types/id-label.model';
import { IdTitle } from '@/types/id-title.model';
import { ResourceCategory } from '@/types/resource-category.model';
import AddIcon from '@mui/icons-material/Add';
import { Chip } from '@mui/material';
import { useEffect, useState } from 'react';
import BadgeSelect from '../Input/BadgeSelect';
import { ResourceCategoryCreateModal } from './ResourceCategoryCreateModal';

export interface ResourceCategoriesSelectAddProps {
  resourceCategories: IdTitle[];
  resourceCategoriesSelected: IdTitle['id'][];
  onChange: (selectedCategoryIds: number[]) => void;
  className?: string;
}

export default function ResourceCategoriesSelectAdd({
  resourceCategories,
  resourceCategoriesSelected,
  onChange,
  className = '',
}: ResourceCategoriesSelectAddProps) {
  const [modalIsActive, setModalIsActive] = useState<boolean>(false);
  const showModal = () => setModalIsActive(true);
  const hideModal = () => setModalIsActive(false);

  const [catsSelected, setCatsSelected] = useState<IdLabel['id'][]>(
    resourceCategoriesSelected
  );
  const [cats, setCats] = useState<IdLabel[]>(
    resourceCategories.map(idTitleToIdLabel)
  );

  useEffect(() => {
    if (!isEqual(resourceCategoriesSelected, catsSelected))
      setCatsSelected(resourceCategoriesSelected);
  }, [resourceCategoriesSelected]);

  const updateAndOutput = (newSelected: IdLabel['id'][]) => {
    setCatsSelected(newSelected);
    onChange(newSelected);
  };

  const addCategoryToBadges = (newCategory: ResourceCategory | undefined) => {
    if (newCategory) {
      resourceCategories.push(newCategory);
      const newBadge = {
        ...idTitleToIdLabel(newCategory),
        isActivated: true,
      };
      setCats([...cats, newBadge]);
      updateAndOutput([...catsSelected, newBadge.id]);
    }
    hideModal();
  };

  const addButton: JSX.Element = (
    <Chip
      icon={<AddIcon />}
      label="Neue Kategorie"
      onClick={() => showModal()}
      sx={{
        backgroundColor: 'grey.300',
        '&:hover': { backgroundColor: 'grey.400' },
      }}
    />
  );

  return (
    <div className={className} style={{ marginTop: '4px' }}>
      <BadgeSelect
        elements={cats}
        value={catsSelected}
        onChange={updateAndOutput}
        elemAppended={addButton}
      />

      <ResourceCategoryCreateModal
        show={modalIsActive}
        onClose={addCategoryToBadges}
      />
    </div>
  );
}
