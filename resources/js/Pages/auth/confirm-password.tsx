import InputError from '@/component/inputs/input-error';
import InputLabel from '@/component/inputs/input-label';
import PrimaryButton from '@/component/inputs/primary-button';
import TextInput from '@/component/inputs/text-input';
import GuestLayout from '@/layouts/guest-layout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';

export default function ConfirmPassword() {
  const { data, setData, post, processing, errors, reset } = useForm({
    password: '',
  });

  useEffect(() => () => reset('password'), [reset]);

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    post(route('password.confirm'));
  };

  return (
    <GuestLayout>
      <Head title="Confirm Password" />

      <div className="mb-4 text-sm text-gray-600">This is a secure area of the application. Please confirm your password before continuing.</div>

      <form onSubmit={submit}>
        <div className="mt-4">
          <InputLabel htmlFor="password" value="Password" />

          <TextInput
            id="password"
            type="password"
            name="password"
            value={data.password}
            className="mt-1 block w-full"
            isFocused={true}
            onChange={(e) => setData('password', e.target.value)}
          />

          <InputError message={errors.password} className="mt-2" />
        </div>

        <div className="mt-4 flex items-center justify-end">
          <PrimaryButton className="ms-4" disabled={processing}>
            Confirm
          </PrimaryButton>
        </div>
      </form>
    </GuestLayout>
  );
}
