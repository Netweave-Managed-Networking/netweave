import { idNameToIdLabel } from '@/helpers/idNameToIdLabel.helper';
import { StakeholderCategoryMin } from '@/types/stakeholder-category-min.model';
import { useState } from 'react';
import BadgeSelect from './BadgeSelect';
import InputError from './InputError';
import InputLabel from './InputLabel';

export interface StakeholderCategoriesSelectAdd {
  stakeholderCategories: StakeholderCategoryMin[];
  stakeholder_categories_errors: string | undefined;
  onChange: (selectedCategoryIds: number[]) => void;
}

export default function StakeholderCategoriesSelectAdd({
  stakeholderCategories,
  stakeholder_categories_errors,
  onChange,
}: StakeholderCategoriesSelectAdd) {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  return (
    <div>
      <InputLabel
        htmlFor="stakeholder_categories"
        value="Kategorien"
        required
      />
      <BadgeSelect
        elements={stakeholderCategories.map(idNameToIdLabel)}
        onChange={selected => {
          setSelectedCategoryIds(selected);
          onChange(selectedCategoryIds);
        }}
        add={{
          label: 'Neue Kategorie',
          onAdd: () => console.log('addClicked'),
        }}
        className="mt-1 block w-full"
      />
      <InputError message={stakeholder_categories_errors} className="mt-2" />
    </div>
  );
}
