import InputError from '@/component/inputs/input-error';
import InputLabel from '@/component/inputs/input-label';
import { isEqual } from '@/helpers/is-equal.object.helper';
import { emptyRestriction, RestrictionCreate, RestrictionCreateErrors, restrictionMax } from '@/types/restriction-create.model';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import TextArea from '../inputs/text-area';
import { MaxTextSize } from '../utils/max-text-size';

export function RestrictionInput({
  onChange,
  autoFocus,
  errors,
  type,
}: {
  /**
   * @param restriction the current RestrictionCreate object after each input change
   * @param isPristine `true`: all fields are empty, `false`: at least one field is not
   */
  onChange: (restriction: RestrictionCreate, isPristine: boolean) => void;
  errors: RestrictionCreateErrors;
  autoFocus?: boolean;
  type: RestrictionCreate['type'];
}) {
  const { data, setData } = useForm<RestrictionCreate>(emptyRestriction(type));

  useEffect(() => onChange(data, isEqual(data, emptyRestriction(type))), [onChange, data, type]);

  return (
    <div className="mt-5">
      <div className="align-end flex justify-between">
        <InputLabel htmlFor={`restriction_${type}`} value={`${type === 'regional' ? 'Regionale' : 'Thematische'} Einschränkungen`} />
        <MaxTextSize value={data.description} max={restrictionMax.description} />
      </div>
      <TextArea
        id={`restriction_${type}`}
        autoFocus={!!autoFocus}
        value={data.description}
        onChange={(e) => setData('description', e.target.value)}
        className="mt-1 block w-full"
        rows={3}
      />
      <InputError message={errors.description} className="mt-2" />
    </div>
  );
}
