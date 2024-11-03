import { idNameToIdLabel } from '@/helpers/idNameToIdLabel.helper';
import { StakeholderCategoryMin } from '@/types/stakeholder-category-min.model';
import { StakeholderCategory } from '@/types/stakeholder-category.model';
import { useCallback, useState } from 'react';
import { BadgeElement } from './Badge';
import BadgeSelect from './BadgeSelect';
import InputError from './InputError';
import InputLabel from './InputLabel';
import { StakeholderCategoryCreateModal } from './StakeholderCategoryCreateModal';

export interface StakeholderCategoriesSelectAdd {
  stakeholderCategories: StakeholderCategoryMin[];
  stakeholderCategoriesErrors: string | undefined;
  onChange: (selectedCategoryIds: number[]) => void;
}

export default function StakeholderCategoriesSelectAdd({
  stakeholderCategories,
  stakeholderCategoriesErrors,
  onChange,
}: StakeholderCategoriesSelectAdd) {
  const [modalIsActive, setModalIsActive] = useState<boolean>(false);
  const showModal = () => setModalIsActive(true);
  const hideModal = () => setModalIsActive(false);

  const [stakeholderCategoryBadges, setStakeholderCategoryBadges] = useState<
    BadgeElement[]
  >(stakeholderCategories.map(idNameToIdLabel));

  const addCategoryToBadges = useCallback(
    (newCategory: StakeholderCategory | undefined) => {
      if (newCategory) {
        stakeholderCategories.push(newCategory);
        const newBadge = { ...idNameToIdLabel(newCategory), isActivated: true };
        setStakeholderCategoryBadges([...stakeholderCategoryBadges, newBadge]);
      }
      hideModal();
    },
    [stakeholderCategories]
  );

  return (
    <div>
      <InputLabel
        htmlFor="stakeholder_categories"
        value="Kategorien"
        required
      />
      <BadgeSelect
        elements={stakeholderCategoryBadges}
        onChange={onChange}
        add={{ label: 'Neue Kategorie', onAdd: () => showModal() }}
        className="mt-1 block w-full"
      />
      <InputError message={stakeholderCategoriesErrors} className="mt-2" />

      <StakeholderCategoryCreateModal
        show={modalIsActive}
        onClose={addCategoryToBadges}
      />
    </div>
  );
}
