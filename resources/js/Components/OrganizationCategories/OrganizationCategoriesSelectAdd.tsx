import { idNameToIdLabel } from '@/helpers/idNameToIdLabel.helper';
import { IdName } from '@/types/id-name.model';
import { OrganizationCategory } from '@/types/organization-category.model';
import { useCallback, useState } from 'react';
import BadgeSelect from '../Input/BadgeSelect';
import { BadgeElement } from '../Util/Badge';
import { OrganizationCategoryCreateModal } from './OrganizationCategoryCreateModal';

export interface OrganizationCategoriesSelectAddProps {
  organizationCategories: IdName[];
  onChange: (selectedCategoryIds: number[]) => void;
  className?: string;
}

export default function OrganizationCategoriesSelectAdd({
  organizationCategories,
  onChange,
  className = '',
}: OrganizationCategoriesSelectAddProps) {
  const [modalIsActive, setModalIsActive] = useState<boolean>(false);
  const showModal = () => setModalIsActive(true);
  const hideModal = () => setModalIsActive(false);

  const [organizationCategoryBadges, setOrganizationCategoryBadges] = useState<
    BadgeElement[]
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

  return (
    <div className={className} style={{ marginTop: '4px' }}>
      <BadgeSelect
        elements={organizationCategoryBadges}
        onChange={onChange}
        add={{ label: 'Neue Kategorie', onAdd: () => showModal() }}
      />

      <OrganizationCategoryCreateModal
        show={modalIsActive}
        onClose={addCategoryToBadges}
      />
    </div>
  );
}
