import InputError from '@/component/inputs/input-error';
import InputLabel from '@/component/inputs/input-label';
import TextInput from '@/component/inputs/text-input';
import { isEqual } from '@/helpers/is-equal.object.helper';
import { ContactPersonCreate, ContactPersonCreateErrors, emptyContactPerson, personMax } from '@/types/contact-person-create.model';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { MaxTextSize } from '../utils/max-text-size';

export function ContactPersonInput({
  onChange,
  autoFocus,
  errors,
  isNameRequired,
}: {
  /**
   * @param contactPerson the current ContactPersonCreate object after each input change
   * @param isPristine `true`: all fields are empty, `false`: at least one field is not
   */
  onChange: (contactPerson: ContactPersonCreate, isPristine: boolean) => void;
  errors: ContactPersonCreateErrors;
  isNameRequired: boolean;
  autoFocus?: boolean;
}) {
  const { data, setData } = useForm<ContactPersonCreate>(emptyContactPerson);

  useEffect(() => onChange(data, isEqual(data, emptyContactPerson)), [onChange, data]);

  return (
    <>
      {/* Contact Person Name */}
      <div className="mt-5">
        <div className="align-end flex justify-between">
          <InputLabel htmlFor="name" value="Name" required={isNameRequired} />
          <MaxTextSize value={data.name} max={personMax.name} />
        </div>
        <TextInput
          id="name"
          autoFocus={!!autoFocus}
          value={data.name}
          onChange={(e) => setData('name', e.target.value)}
          required={isNameRequired}
          className="mt-1 block w-full"
        />
        <InputError message={errors.name} className="mt-2" />
      </div>

      {/* Email */}
      <div className="mt-5">
        <div className="align-end flex justify-between">
          <InputLabel htmlFor="email" value="Email" />
          <MaxTextSize value={data.email} max={personMax.email} />
        </div>
        <TextInput
          id="email"
          type="email"
          value={data.email ?? undefined}
          onChange={(e) => setData('email', e.target.value)}
          className="mt-1 block w-full"
        />
        <InputError message={errors.email} className="mt-2" />
      </div>

      {/* Phone */}
      <div className="mt-5">
        <div className="align-end flex justify-between">
          <InputLabel htmlFor="phone" value="Telefonnummer" />
          <MaxTextSize value={data.phone} max={personMax.phone} />
        </div>
        <TextInput id="phone" value={data.phone ?? undefined} onChange={(e) => setData('phone', e.target.value)} className="mt-1 block w-full" />
        <InputError message={errors.phone} className="mt-2" />
      </div>

      {/* Postcode and City */}
      <div className="mt-5">
        <div className="align-end flex justify-between">
          <InputLabel htmlFor="postcode_city" value="PLZ und Stadt" />
          <MaxTextSize value={data.postcode_city} max={personMax.postcode_city} />
        </div>
        <TextInput
          id="postcode_city"
          value={data.postcode_city ?? undefined}
          onChange={(e) => setData('postcode_city', e.target.value)}
          className="mt-1 block w-full"
        />
        <InputError message={errors.postcode_city} className="mt-2" />
      </div>

      {/* Street and House Number */}
      <div className="mt-5">
        <div className="align-end flex justify-between">
          <InputLabel htmlFor="street_hnr" value="Straße und Hausnummer" />
          <MaxTextSize value={data.street_hnr} max={personMax.street_hnr} />
        </div>
        <TextInput
          id="street_hnr"
          value={data.street_hnr ?? undefined}
          onChange={(e) => setData('street_hnr', e.target.value)}
          className="mt-1 block w-full"
        />
        <InputError message={errors.street_hnr} className="mt-2" />
      </div>
    </>
  );
}
