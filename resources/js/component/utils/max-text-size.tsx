/**
 * shows how many bytes the given string takes up and wether it exceeds the given limit.
 * @param value string of which byte size is calculated.
 * @param max limit: maximum byte size allowed.
 */
export function MaxTextSize({ value, max }: { value: string | null | undefined; max: number }) {
  const size = new Blob([value ?? '']).size;
  return (
    size > 0 && (
      <span className={`block text-sm ${size > max ? 'font-extrabold text-red-800' : 'font-medium text-gray-700'}`}>
        {size}/{max}
      </span>
    )
  );
}
