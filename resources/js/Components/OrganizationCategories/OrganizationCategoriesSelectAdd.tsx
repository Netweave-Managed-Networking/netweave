import { idNameToIdLabel } from '@/helpers/idNameToIdLabel.helper';
import { IdName } from '@/types/id-name.model';
import SelectAdd from '../Input/SelectAdd';
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
