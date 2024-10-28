import AddIcon from '@mui/icons-material/Add';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import Badge, { BadgeElement } from './Badge';

export type BadgeSelectProps = {
  elements: BadgeElement[];
  onChange: (selectedElements: number[]) => void;
  add?: { onAdd: () => void; label: string };
  className?: string;
};

export default function BadgeSelect({
  elements,
  onChange,
  add,
  className,
}: BadgeSelectProps) {
  const [selectedElementIds, setSelectedElements] = useState<number[]>([]);

  useEffect(() => onChange(selectedElementIds), [selectedElementIds, onChange]);

  const toggleElement = (id: number) => {
    setSelectedElements(selectedElements =>
      selectedElements.includes(id)
        ? selectedElements.filter(elementId => elementId !== id)
        : [...selectedElements, id]
    );
  };

  const selectableElements = elements.map(elem => ({
    ...elem,
    isActivated: elem.isActivated ? true : selectedElementIds.includes(elem.id),
    onClick: () => {
      toggleElement(elem.id);
      return elem.onClick ? elem.onClick() : void 0;
    },
  }));

  const sortedElements = selectableElements.sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  return (
    <Box display="flex" flexWrap="wrap" gap={1} className={className}>
      {sortedElements.map(element => (
        <Badge key={element.id} element={element} />
      ))}
      {!!add && (
        <Badge
          element={{
            id: -1,
            label: add.label,
            icon: <AddIcon />,
            isActivated: false,
            onClick: add.onAdd,
          }}
        />
      )}
    </Box>
  );
}
