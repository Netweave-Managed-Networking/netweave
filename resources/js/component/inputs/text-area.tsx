import { forwardRef, TextareaHTMLAttributes, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextArea(
  { className = '', isFocused = false, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { isFocused?: boolean },
  ref,
) {
  const localRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => localRef.current?.focus(),
  }));

  useEffect(() => {
    if (isFocused) {
      localRef.current?.focus();
    }
  }, []);

  return (
    <textarea
      {...props}
      className={'rounded-md border border-gray-300 bg-white p-2 focus:border-indigo-500 focus:ring-indigo-500 ' + className}
      ref={localRef}
    />
  );
});
