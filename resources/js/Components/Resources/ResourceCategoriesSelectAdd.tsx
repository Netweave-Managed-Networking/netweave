import { idTitleToIdLabel } from '@/helpers/idTitleToIdLabel.helper';
import { IdTitle } from '@/types/id-title.model';
import SelectAdd from '../Input/SelectAdd';
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
  return (
    <SelectAdd
      items={resourceCategories}
      itemsSelected={resourceCategoriesSelected}
      itemToIdLabel={idTitleToIdLabel}
      addSelectableButtonLabel="Neue Kategorie"
      CreateItemModalComponent={ResourceCategoryCreateModal}
      onChange={onChange}
      className={className}
    />
  );
}
