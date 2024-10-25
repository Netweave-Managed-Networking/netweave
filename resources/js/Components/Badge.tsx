import { Chip } from '@mui/material';

export type BadgeElement = {
  id: number;
  label: string;
};

export type BadgeProps = {
  element: BadgeElement;
  isActivated: boolean;
};

export default function Badge({ element, isActivated }: BadgeProps) {
  return (
    <Chip
      label={element.label}
      clickable
      sx={{
        backgroundColor: isActivated ? 'grey.900' : 'grey.300',
        color: isActivated ? 'white' : 'black',
        textShadow: isActivated ? '.001em .001em #fff' : 'none',
        '&:hover': {
          backgroundColor: isActivated ? 'grey.800' : 'grey.200',
        },
      }}
    />
  );
}
