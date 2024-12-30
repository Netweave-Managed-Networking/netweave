import { LabelHTMLAttributes } from 'react';

export default function InputLabel({
  value,
  className = '',
  required = false,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & {
  value?: string;
  required?: boolean;
}) {
  return (
    <div className="flex">
      <label
        {...props}
        className={`block font-medium text-sm text-gray-700 ` + className}
      >
        {value ? value : children}
      </label>
      {required && (
        <span
          className="text-red-700"
          style={{
            fontSize: '1.5rem',
            lineHeight: '1.25rem',
            margin: '5px 3px -5px',
          }}
        >
          *
        </span>
      )}
    </div>
  );
}
