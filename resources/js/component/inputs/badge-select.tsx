import { IdLabel } from '@/types/id-label.model';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import Badge from '../utils/badge';

export type BadgeSelectProps = {
  elements: IdLabel[];
  /** array of activated elements */
  value: IdLabel['id'][];
  /** append a custom element to the list of Badges */
  elemAppended?: JSX.Element;
  onChange: (selectedElements: number[]) => void;
  className?: string;
};

export default function BadgeSelect({ onChange, elements, value, elemAppended, className }: BadgeSelectProps) {
  const [elementsActivated, setElementsActivated] = useState<IdLabel['id'][]>(value);

  useEffect(() => setElementsActivated(value), [value]);

  const isActivated = (id: IdLabel['id']): boolean => elementsActivated.includes(id);

  return (
    <Box display="flex" flexWrap="wrap" gap={1} className={className}>
      {sortByLabel(elements).map((element) => (
        <Badge
          key={element.id}
          label={element.label}
          isActivated={isActivated(element.id)}
          onClick={() => {
            const newElementsActivated = isActivated(element.id)
              ? elementsActivated.filter((id) => id !== element.id)
              : [...elementsActivated, element.id];
            setElementsActivated(newElementsActivated);
            onChange(newElementsActivated);
          }}
        />
      ))}
      {!!elemAppended && elemAppended}
    </Box>
  );
}

const sortByLabel = (elements: IdLabel[]): IdLabel[] => elements.sort((a, b) => a.label.localeCompare(b.label));
