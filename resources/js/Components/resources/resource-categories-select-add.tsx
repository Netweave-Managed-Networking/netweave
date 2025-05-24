import { idTitleToIdLabel } from '@/helpers/id-title-to-id-label.helper';
import { IdTitle } from '@/types/id-title.model';
import SelectAdd from '../input/select-add';
import { ResourceCategoryCreateModal } from './resource-category-create-modal';

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
