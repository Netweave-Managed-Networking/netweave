export function MaxTextLength({
  value,
  max,
}: {
  value: string | undefined;
  max: number;
}) {
  const length = value?.length ?? 0;
  return (
    length > 0 && (
      <span
        className={`block text-sm ${
          length > max
            ? 'font-extrabold text-red-800'
            : 'font-medium text-gray-700'
        }`}
      >
        {length}/{max}
      </span>
    )
  );
}
