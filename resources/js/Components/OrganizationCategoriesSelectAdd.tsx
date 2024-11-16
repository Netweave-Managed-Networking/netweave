import { idNameToIdLabel } from '@/helpers/idNameToIdLabel.helper';
import { OrganizationCategoryMin } from '@/types/organization-category-min.model';
import { OrganizationCategory } from '@/types/organization-category.model';
import { useCallback, useState } from 'react';
import { BadgeElement } from './Badge';
import BadgeSelect from './BadgeSelect';
import InputError from './InputError';
import InputLabel from './InputLabel';
import { OrganizationCategoryCreateModal } from './OrganizationCategoryCreateModal';

export interface OrganizationCategoriesSelectAdd {
  organizationCategories: OrganizationCategoryMin[];
  organizationCategoriesErrors: string | undefined;
  onChange: (selectedCategoryIds: number[]) => void;
}

export default function OrganizationCategoriesSelectAdd({
  organizationCategories,
  organizationCategoriesErrors,
  onChange,
}: OrganizationCategoriesSelectAdd) {
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
    [organizationCategories]
  );

  return (
    <div>
      <InputLabel value="Kategorien" required />
      <BadgeSelect
        elements={organizationCategoryBadges}
        onChange={onChange}
        add={{ label: 'Neue Kategorie', onAdd: () => showModal() }}
        className="mt-1 block w-full"
      />
      <InputError message={organizationCategoriesErrors} className="mt-2" />

      <OrganizationCategoryCreateModal
        show={modalIsActive}
        onClose={addCategoryToBadges}
      />
    </div>
  );
}
