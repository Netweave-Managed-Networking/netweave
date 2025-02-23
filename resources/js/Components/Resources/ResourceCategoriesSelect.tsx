import { idTitleToIdLabel } from '@/helpers/idTitleToIdLabel.helper';
import { IdTitle } from '@/types/id-title.model';
import { useState } from 'react';
import BadgeSelect from '../Input/BadgeSelect';
import { BadgeElement } from '../Util/Badge';

export interface ResourceCategoriesSelectProps {
  resourceCategories: IdTitle[];
  onChange: (selectedCategoryIds: number[]) => void;
  className?: string;
}

export default function ResourceCategoriesSelect({
  resourceCategories,
  onChange,
  className = '',
}: ResourceCategoriesSelectProps) {
  const [resourceCategoryBadges] = useState<BadgeElement[]>(
    resourceCategories.map(idTitleToIdLabel)
  );

  return (
    <div className={className} style={{ marginTop: '4px' }}>
      <BadgeSelect elements={resourceCategoryBadges} onChange={onChange} />
    </div>
  );
}
