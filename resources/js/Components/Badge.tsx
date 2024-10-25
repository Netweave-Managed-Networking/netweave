import { Chip } from '@mui/material';

export type BadgeElement = {
  id: number;
  label: string;
};

export type BadgeProps = {
  element: BadgeElement;
  isActivated?: boolean;
  isClickable?: boolean;
};

export default function Badge({
  element,
  isActivated,
  isClickable,
}: BadgeProps) {
  return (
    <Chip
      label={element.label}
      clickable={isClickable}
      sx={{
        backgroundColor: isActivated ? 'grey.900' : 'grey.300',
        color: isActivated ? 'white' : 'black',
        textShadow: isActivated ? '.001em .001em #fff' : 'none',
        ...(isClickable && {
          '&:hover': { backgroundColor: isActivated ? 'grey.800' : 'grey.200' },
        }),
      }}
    />
  );
}
