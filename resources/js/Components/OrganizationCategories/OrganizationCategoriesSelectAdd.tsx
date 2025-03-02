import { idNameToIdLabel } from '@/helpers/idNameToIdLabel.helper';
import { IdLabel } from '@/types/id-label.model';
import { IdName } from '@/types/id-name.model';
import { OrganizationCategory } from '@/types/organization-category.model';
import AddIcon from '@mui/icons-material/Add';
import { Chip } from '@mui/material';
import { useCallback, useState } from 'react';
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

  const [organizationCategoryBadges, setOrganizationCategoryBadges] = useState<
    IdLabel[]
  >(organizationCategories.map(idNameToIdLabel));

  const addCategoryToBadges = useCallback(
    (newCategory: OrganizationCategory | undefined) => {
      if (newCategory) {
        organizationCategories.push(newCategory);
        const newBadge = { ...idNameToIdLabel(newCategory), isActivated: true };
        setOrganizationCategoryBadges([
          ...organizationCategoryBadges,
          newBadge,
        ]);
      }
      hideModal();
    },
    [organizationCategories, organizationCategoryBadges]
  );

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
        elements={organizationCategoryBadges}
        value={organizationCategoriesSelected}
        onChange={onChange}
        elemAppended={addButton}
      />

      <OrganizationCategoryCreateModal
        show={modalIsActive}
        onClose={addCategoryToBadges}
      />
    </div>
  );
}
