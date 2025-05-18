import { IdLabel } from '@/types/id-label.model';
import { IdTitle } from '@/types/id-title.model';

export const idTitleToIdLabel = (elem: IdTitle): IdLabel => ({
  id: elem.id,
  label: elem.title,
});
