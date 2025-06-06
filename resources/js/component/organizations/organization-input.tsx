import InputError from '@/component/inputs/input-error';
import InputLabel from '@/component/inputs/input-label';
import TextInput from '@/component/inputs/text-input';
import { isEqual } from '@/helpers/is-equal.object.helper';
import { emptyOrganizationMin, OrganizationCreateMin, OrganizationCreateMinErrors, orgMinMax } from '@/types/organization-create-min.model';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { MaxTextSize } from '../utils/max-text-size';

export function OrganizationInput({
  onChange,
  autoFocus,
  errors,
  isNameRequired,
  slotTop,
  slotRight,
  slotBottom,
}: {
  /**
   * @param organization the current OrganizationUpdate object after each input change
   * @param isPristine `true`: all fields are empty, `false`: at least one field is not
   */
  onChange: (organization: OrganizationCreateMin, isPristine: boolean) => void;
  errors: OrganizationCreateMinErrors;
  isNameRequired: boolean;
  autoFocus?: boolean;

  slotTop?: React.ReactNode;
  slotRight?: React.ReactNode;
  slotBottom?: React.ReactNode;
}) {
  const { data, setData } = useForm<OrganizationCreateMin>(emptyOrganizationMin);

  useEffect(() => onChange(data, isEqual(data, emptyOrganizationMin)), [data, onChange]);

  return (
    <>
      {/* Organization Name */}
      <div>
        <div className="align-end flex justify-between">
          <InputLabel htmlFor="name" value="Name der Organisation" required />
          <MaxTextSize value={data.name} max={orgMinMax.name} />
        </div>
        <TextInput
          id="name"
          autoFocus={autoFocus}
          value={data.name}
          onChange={(e) => setData('name', e.target.value)}
          required={isNameRequired}
          className="mt-1 block w-full"
        />
        <InputError message={errors.name} className="mt-2" />
      </div>

      {slotTop}

      {/* split between contact person and organization */}
      <div className="flex w-full items-end">
        {/* Organization */}
        <div className="w-1/2 p-5">
          {/* Email */}
          <div className="mt-5">
            <div className="align-end flex justify-between">
              <InputLabel htmlFor="email" value="Email der Organisation" />
              <MaxTextSize value={data.email} max={orgMinMax.email} />
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
              <InputLabel htmlFor="phone" value="Telefonnummer der Organisation" />
              <MaxTextSize value={data.phone} max={orgMinMax.phone} />
            </div>
            <TextInput id="phone" value={data.phone ?? undefined} onChange={(e) => setData('phone', e.target.value)} className="mt-1 block w-full" />
            <InputError message={errors.phone} className="mt-2" />
          </div>

          {/* Postcode and City */}
          <div className="mt-5">
            <div className="align-end flex justify-between">
              <InputLabel htmlFor="postcode_city" value="PLZ und Stadt der Organisation" />
              <MaxTextSize value={data.postcode_city} max={orgMinMax.postcode_city} />
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
              <InputLabel htmlFor="street_hnr" value="Straße und Hausnummer der Organisation" />
              <MaxTextSize value={data.street_hnr} max={orgMinMax.street_hnr} />
            </div>
            <TextInput
              id="street_hnr"
              value={data.street_hnr ?? undefined}
              onChange={(e) => setData('street_hnr', e.target.value)}
              className="mt-1 block w-full"
            />
            <InputError message={errors.street_hnr} className="mt-2" />
          </div>
        </div>

        {slotRight}
      </div>

      {slotBottom}
    </>
  );
}
