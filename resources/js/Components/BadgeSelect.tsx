import AddIcon from '@mui/icons-material/Add';
import { Box } from '@mui/material';
import { useCallback, useEffect } from 'react';
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
  // toggle element and callback with changes
  const toggleElement = useCallback(
    (id: number) => {
      toggleBadgeElement(id, elements);
      onChange(getOnlyActivated(elements));
    },
    [elements]
  );

  // react to changes to elements array from outside
  useEffect(() => onChange(getOnlyActivated(elements)), [elements]);

  // make elements able to toggle and sort them
  const elementsSelectable = addFnToOnClick(elements, toggleElement);
  const elementsSelectableSorted = sortByLabel(elementsSelectable);

  return (
    <Box display="flex" flexWrap="wrap" gap={1} className={className}>
      {/* categories */}
      {elementsSelectableSorted.map(element => (
        <Badge key={element.id} element={element} />
      ))}

      {/* add button */}
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

const toggleBadgeElement = (
  toToggleId: number,
  allElements: BadgeElement[]
) => {
  const elemToToggle = allElements.find(elem => elem.id === toToggleId);
  if (elemToToggle) {
    elemToToggle.isActivated = !elemToToggle.isActivated;
  }
  return allElements;
};

const addFnToOnClick = (elements: BadgeElement[], fn: (id: number) => void) =>
  elements.map(elem => ({
    ...elem,
    onClick: () => {
      fn(elem.id);
      return elem.onClick ? elem.onClick() : void 0;
    },
  }));

const sortByLabel = (elements: BadgeElement[]) =>
  elements.sort((a, b) => a.label.localeCompare(b.label));

const getOnlyActivated = (elements: BadgeElement[]) =>
  elements.filter(e => e.isActivated).map(e => e.id);
