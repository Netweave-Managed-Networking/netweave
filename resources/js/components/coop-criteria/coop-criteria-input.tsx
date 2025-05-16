import InputError from '@/components/input/input-error';
import InputLabel from '@/components/input/input-label';
import { isEqual } from '@/helpers/is-equal.object.helper';
import { CoopCriteriaCreate, CoopCriteriaCreateErrors, coopMax, emptyCoopCriteria } from '@/types/coop-criteria-create.model';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import TextArea from '../input/text-area';
import { MaxTextSize } from '../util/max-text-size';

export function CoopCriteriaInput({
  onChange,
  autoFocus,
  errors,
}: {
  /**
   * @param restriction the current CoopCriteriaCreate object after each input change
   * @param isPristine `true`: all fields are empty, `false`: at least one field is not
   */
  onChange: (restriction: CoopCriteriaCreate, isPristine: boolean) => void;
  errors: CoopCriteriaCreateErrors;
  autoFocus?: boolean;
}) {
  const { data, setData } = useForm<CoopCriteriaCreate>(emptyCoopCriteria);

  useEffect(() => onChange(data, isEqual(data, emptyCoopCriteria)), [onChange, data]);

  return (
    <div className="mt-5 flex justify-between gap-4">
      <div className="w-1/2">
        <div className="align-end flex justify-between">
          <InputLabel htmlFor="for_coop" value="Kriterien, die für eine Kooperation nötig sind" />
          <MaxTextSize value={data.for_coop} max={coopMax.for_coop} />
        </div>
        <TextArea
          id="for_coop"
          autoFocus={!!autoFocus}
          value={data.for_coop ?? undefined}
          onChange={(e) => setData('for_coop', e.target.value)}
          className="mt-1 block w-full"
          rows={5}
        />
        <InputError message={errors.for_coop} className="mt-2" />
      </div>
      <div className="w-1/2">
        <div className="align-end flex justify-between">
          <InputLabel htmlFor="ko_no_coop" value="Ausschlusskriterien, die gegen eine Kooperation sprechen" />
          <MaxTextSize value={data.ko_no_coop} max={coopMax.ko_no_coop} />
        </div>
        <TextArea
          id="ko_no_coop"
          value={data.ko_no_coop ?? undefined}
          onChange={(e) => setData('ko_no_coop', e.target.value)}
          className="mt-1 block w-full"
          rows={5}
        />
        <InputError message={errors.ko_no_coop} className="mt-2" />
      </div>
    </div>
  );
}
