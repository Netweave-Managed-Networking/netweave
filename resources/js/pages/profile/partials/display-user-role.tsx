import { PageProps } from '@/types/page-props.type';
import { usePage } from '@inertiajs/react';

export default function DisplayUserRole({ className = '' }: { className: string }) {
  const user = usePage<PageProps>().props.auth.user;

  return (
    <section className={className}>
      <header>
        <h2 className="text-lg font-medium text-gray-900">Role & Permissions</h2>

        <p className="mt-1 text-sm text-gray-600">
          <span>You are an&nbsp;</span>
          <code className="bg-pink-300 px-1">{user.role}</code>.
        </p>
        <p className="mt-1 text-sm text-gray-600">
          {user.role === 'admin' ? (
            <span>This allows you to create InvitationCodes in order to register new users.</span>
          ) : (
            <span>
              You are allowed to create and edit Organizations and Resources.
              <br />
              You are not allowed to register new users.
            </span>
          )}
        </p>
      </header>
    </section>
  );
}
