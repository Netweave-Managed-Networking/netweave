import { Chip, ChipOwnProps } from '@mui/material';

export type BadgeElement = {
  id: number;
  label: string;
  icon?: ChipOwnProps['icon'];
  isActivated?: boolean;
  onClick?: () => void;
};

export default function Badge({ element }: { element: BadgeElement }) {
  const { label, icon, onClick, isActivated } = element;
  const isClickable = !!onClick;

  return (
    <Chip
      icon={icon}
      label={label}
      clickable={isClickable}
      onClick={onClick}
      className={`BadgeChip ${isActivated ? 'BadgeChipActivated' : ''}`}
      sx={{
        backgroundColor: isActivated ? 'grey.900' : 'grey.300',
        color: isActivated ? 'white' : 'black',
        textShadow: isActivated ? '.001em .001em #fff' : 'none',
        ...(isClickable && {
          '&:hover': {
            backgroundColor: isActivated ? 'grey.600' : 'grey.400',
          },
          // focusVisible is set in app.scss
        }),
      }}
    />
  );
}
