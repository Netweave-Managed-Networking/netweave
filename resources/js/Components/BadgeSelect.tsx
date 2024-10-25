import { Box, Chip } from '@mui/material';
import { useEffect, useState } from 'react';

type Element = {
  id: number;
  name: string;
};

type BadgeSelectProps = {
  elements: Element[];
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

  const sortedElements = elements.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Box display="flex" flexWrap="wrap" gap={1} className={className}>
      {sortedElements.map(element => (
        <Chip
          key={element.id}
          label={element.name}
          clickable
          onClick={() => toggleElement(element.id)}
          sx={{
            backgroundColor: isSelected(element.id) ? 'grey.900' : 'grey.300',
            color: isSelected(element.id) ? 'white' : 'black',
            textShadow: isSelected(element.id) ? '.001em .001em #fff' : 'none',
            '&:hover': {
              backgroundColor: isSelected(element.id) ? 'grey.800' : 'grey.200',
            },
          }}
        />
      ))}
    </Box>
  );
}
