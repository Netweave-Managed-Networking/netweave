import { ReactNode } from 'react';

export function Tile({ children }: { children?: ReactNode | undefined }) {
  return (
    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
      <div className="flex items-center p-6 text-gray-900" style={{ maxHeight: '72px' }}>
        {children}
      </div>
    </div>
  );
}
