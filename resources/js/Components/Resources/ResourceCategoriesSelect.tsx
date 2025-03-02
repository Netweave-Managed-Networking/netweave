import { idTitleToIdLabel } from '@/helpers/idTitleToIdLabel.helper';
import { IdLabel } from '@/types/id-label.model';
import { IdTitle } from '@/types/id-title.model';
import { useState } from 'react';
import BadgeSelect from '../Input/BadgeSelect';

export interface ResourceCategoriesSelectProps {
  resourceCategories: IdTitle[];
  resourceCategoriesSelected: IdTitle['id'][];
  onChange: (selectedCategoryIds: number[]) => void;
  className?: string;
}

export default function ResourceCategoriesSelect({
  resourceCategories,
  resourceCategoriesSelected,
  onChange,
  className = '',
}: ResourceCategoriesSelectProps) {
  const [resourceCategoryBadges] = useState<IdLabel[]>(
    resourceCategories.map(idTitleToIdLabel)
  );

  return (
    <div className={className} style={{ marginTop: '4px' }}>
      <BadgeSelect
        elements={resourceCategoryBadges}
        value={resourceCategoriesSelected}
        onChange={onChange}
      />
    </div>
  );
}
