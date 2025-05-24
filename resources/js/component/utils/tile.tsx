import { ReactNode } from 'react';

export function Tile({ children }: { children?: ReactNode | undefined }) {
  return (
    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
      <div
        className="p-6 text-gray-900 flex items-center"
        style={{ maxHeight: '72px' }}
      >
        {children}
      </div>
    </div>
  );
}
