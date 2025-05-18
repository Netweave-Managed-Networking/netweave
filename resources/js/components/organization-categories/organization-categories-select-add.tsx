import { idNameToIdLabel } from '@/helpers/id-dame-to-id-label.helper';
import { IdName } from '@/types/id-name.model';
import SelectAdd from '../input/select-add';
import { OrganizationCategoryCreateModal } from './organization-category-create-modal';

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
  return (
    <SelectAdd
      items={organizationCategories}
      itemsSelected={organizationCategoriesSelected}
      itemToIdLabel={idNameToIdLabel}
      addSelectableButtonLabel="Neue Kategorie"
      CreateItemModalComponent={OrganizationCategoryCreateModal}
      onChange={onChange}
      className={className}
    />
  );
}
