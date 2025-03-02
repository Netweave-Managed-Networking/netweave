import { IdLabel } from '@/types/id-label.model';
import { IdName } from '@/types/id-name.model';

export const idNameToIdLabel = (elem: IdName): IdLabel => ({
  id: elem.id,
  label: elem.name,
});
