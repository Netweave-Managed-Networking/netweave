import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import Badge, { BadgeElement } from './Badge';

type BadgeSelectProps = {
  elements: BadgeElement[];
  onChange: (selectedElements: number[]) => void;
  className?: string;
};

export default function BadgeSelect({
  elements,
  onChange,
  className,
}: BadgeSelectProps) {
  const [selectedElements, setSelectedElements] = useState<number[]>([]);

  useEffect(() => onChange(selectedElements), [selectedElements, onChange]);

  const toggleElement = (id: number) => {
    setSelectedElements(selectedElements =>
      selectedElements.includes(id)
        ? selectedElements.filter(elementId => elementId !== id)
        : [...selectedElements, id]
    );
  };

  const isSelected = (id: number): boolean => selectedElements.includes(id);

  const sortedElements = elements.sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  return (
    <Box display="flex" flexWrap="wrap" gap={1} className={className}>
      {sortedElements.map(element => (
        <div key={element.id} onClick={() => toggleElement(element.id)}>
          <Badge
            element={element}
            isActivated={isSelected(element.id)}
            isClickable={true}
          ></Badge>
        </div>
      ))}
    </Box>
  );
}
