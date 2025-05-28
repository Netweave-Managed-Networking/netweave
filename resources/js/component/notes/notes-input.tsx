import InputError from '@/component/inputs/input-error';
import InputLabel from '@/component/inputs/input-label';
import { isEqual } from '@/helpers/is-equal.object.helper';
import { emptyNotes, NotesCreate, NotesCreateErrors, notesMax } from '@/types/notes-create.model';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import TextArea from '../inputs/text-area';
import { MaxTextSize } from '../utils/max-text-size';

export function NotesInput({
  value,
  onChange,
  autoFocus,
  errors,
}: {
  value?: NotesCreate;
  /**
   * @param notes the current NotesCreate object after each input change
   * @param isPristine `true`: all fields are empty, `false`: at least one field is not
   */
  onChange: (notes: NotesCreate, isPristine: boolean) => void;
  errors: NotesCreateErrors;
  autoFocus?: boolean;
}) {
  const { data, setData } = useForm<NotesCreate>(value ?? emptyNotes);

  useEffect(() => onChange(data, isEqual(data, emptyNotes)), [data]);

  return (
    <div className="mt-5">
      <div className="align-end flex justify-between">
        <InputLabel htmlFor="notes" value="Notizen zum Wesen / Charakter der Organisation" />
        <MaxTextSize value={data.notes} max={notesMax.notes} />
      </div>
      <TextArea
        id="notes"
        autoFocus={!!autoFocus}
        value={data.notes ?? ''}
        onChange={(e) => setData('notes', e.target.value)}
        className="mt-1 block w-full"
        rows={8}
      />
      <InputError message={errors.notes} className="mt-2" />
    </div>
  );
}
