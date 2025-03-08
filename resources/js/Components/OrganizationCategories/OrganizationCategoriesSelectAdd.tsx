import { idNameToIdLabel } from '@/helpers/idNameToIdLabel.helper';
import { IdLabel } from '@/types/id-label.model';
import { IdName } from '@/types/id-name.model';
import { OrganizationCategory } from '@/types/organization-category.model';
import AddIcon from '@mui/icons-material/Add';
import { Chip } from '@mui/material';
import { useState } from 'react';
import BadgeSelect from '../Input/BadgeSelect';
import { OrganizationCategoryCreateModal } from './OrganizationCategoryCreateModal';

export interface OrganizationCategoriesSelectAddProps {
  organizationCategories: IdName[];
  organizationCategoriesSelected: IdName['id'][];
  onChange: (selectedCategoryIds: number[]) => void;
  className?: string;
}

export default function OrganizationCategoriesSelectAdd({
  organizationCategories,
  organizationCategoriesSelected,
  onChange,
  className = '',
}: OrganizationCategoriesSelectAddProps) {
  const [modalIsActive, setModalIsActive] = useState<boolean>(false);
  const showModal = () => setModalIsActive(true);
  const hideModal = () => setModalIsActive(false);

  const [catsSelected, setCatsSelected] = useState<IdLabel['id'][]>(
    organizationCategoriesSelected
  );
  const [cats, setCats] = useState<IdLabel[]>(
    organizationCategories.map(idNameToIdLabel)
  );

  const updateAndOutput = (newSelected: IdLabel['id'][]) => {
    setCatsSelected(newSelected);
    onChange(newSelected);
  };

  const addCategoryToBadges = (
    newCategory: OrganizationCategory | undefined
  ) => {
    if (newCategory) {
      organizationCategories.push(newCategory);
      const newBadge = { ...idNameToIdLabel(newCategory), isActivated: true };
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

      <OrganizationCategoryCreateModal
        show={modalIsActive}
        onClose={addCategoryToBadges}
      />
    </div>
  );
}
