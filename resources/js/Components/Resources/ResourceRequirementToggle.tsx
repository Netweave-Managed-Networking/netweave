import { Resource } from '@/types/resource.model';
import { useState } from 'react';

export type ResourceRequirementToggleProps = {
  onChange: (selected: Resource['type']) => void;
  style?: React.CSSProperties | undefined;
};

export default function ResourceRequirementToggle({
  onChange,
  style,
}: ResourceRequirementToggleProps) {
  const [selected, setSelected] = useState<Resource['type'] | null>(null);

  const handleClick = (option: Resource['type']) => {
    setSelected(option);
    onChange(option);
  };

  return (
    <div
      style={{
        ...style,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top:
            selected === 'resource'
              ? '0%'
              : selected === 'requirement'
                ? '50%'
                : '25%',
          height: '50%',
          width: '100%',
          background: selected === null ? '#ffffff00' : '#000',
          transition: 'top 0.125s ease-in-out',
        }}
      />
      <div
        onClick={() => handleClick('resource')}
        style={{
          flex: 1,

          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',

          cursor: 'pointer',
          borderBottom: selected === null ? '1px solid #ccc' : '',
          zIndex: 1,
          color: selected === 'resource' ? '#fff' : '#000',
          transition: 'color 0.125s ease-in',
        }}
      >
        Ressource
      </div>
      <div
        onClick={() => handleClick('requirement')}
        style={{
          flex: 1,

          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',

          cursor: 'pointer',
          zIndex: 1,
          color: selected === 'requirement' ? '#fff' : '#000',
          transition: 'color 0.125s ease-in',
        }}
      >
        Bedarf
      </div>
    </div>
  );
}
