import InputError from '@/Components/Input/InputError';
import InputLabel from '@/Components/Input/InputLabel';
import PrimaryButton from '@/Components/Input/PrimaryButton';
import TextInput from '@/Components/Input/TextInput';
import { InvitationCodeTooltipButton } from '@/Components/InvitationCodes/InvitationCodeTooltipButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

import { FormEventHandler, useEffect } from 'react';

export default function Register() {
  const invitationCodeFromSearchParam: string | null = new URLSearchParams(
    window.location.search
  ).get('code');

  const { data, setData, post, processing, errors, reset } = useForm({
    invitation_code: invitationCodeFromSearchParam ?? '',
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => () => reset('password', 'password_confirmation'), []); // reset when unmount

  const submit: FormEventHandler = e => {
    e.preventDefault();

    post(route('register'));
  };

  return (
    <GuestLayout>
      <Head title="Register" />

      <form onSubmit={submit}>
        <div>
          <div className="flex items-center">
            <InputLabel htmlFor="invitation_code" value="Code" />
            <InvitationCodeTooltipButton />
          </div>

          <TextInput
            id="invitation_code"
            name="invitation_code"
            value={data.invitation_code}
            placeholder="e.g. g4zw8byq"
            maxLength={8}
            className="mt-1 block w-full"
            style={{ textTransform: 'lowercase' }}
            onChange={e => setData('invitation_code', e.target.value)}
            required
          />

          <InputError message={errors.invitation_code} className="mt-2" />
        </div>

        <div className="mt-4">
          <InputLabel htmlFor="name" value="Name" />

          <TextInput
            id="name"
            name="name"
            value={data.name}
            className="mt-1 block w-full"
            autoComplete="name"
            isFocused={true}
            onChange={e => setData('name', e.target.value)}
            required
          />

          <InputError message={errors.name} className="mt-2" />
        </div>

        <div className="mt-4">
          <InputLabel htmlFor="email" value="Email" />

          <TextInput
            id="email"
            type="email"
            name="email"
            value={data.email}
            className="mt-1 block w-full"
            autoComplete="username"
            onChange={e => setData('email', e.target.value)}
            required
          />

          <InputError message={errors.email} className="mt-2" />
        </div>

        <div className="mt-4">
          <InputLabel htmlFor="password" value="Passwort" />

          <TextInput
            id="password"
            type="password"
            name="password"
            value={data.password}
            className="mt-1 block w-full"
            autoComplete="new-password"
            onChange={e => setData('password', e.target.value)}
            required
          />

          <InputError message={errors.password} className="mt-2" />
        </div>

        <div className="mt-4">
          <InputLabel
            htmlFor="password_confirmation"
            value="Passwort Bestätigen"
          />

          <TextInput
            id="password_confirmation"
            type="password"
            name="password_confirmation"
            value={data.password_confirmation}
            className="mt-1 block w-full"
            autoComplete="new-password"
            onChange={e => setData('password_confirmation', e.target.value)}
            required
          />

          <InputError message={errors.password_confirmation} className="mt-2" />
        </div>

        <div className="flex items-center justify-end mt-4">
          <Link
            href={route('login')}
            className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Bereits registriert?
          </Link>

          <PrimaryButton className="ms-4" disabled={processing}>
            Registrieren
          </PrimaryButton>
        </div>
      </form>
    </GuestLayout>
  );
}
