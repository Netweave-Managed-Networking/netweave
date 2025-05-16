import ApplicationLogo from '@/Components/Logo/ApplicationLogo';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
      <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />

      <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">{children}</div>
    </div>
  );
}
