import { Chip, ChipProps } from '@mui/material';

export type BadgeProps = {
  label: string;
  isActivated: boolean;
} & ChipProps;

export default function Badge({ label, isActivated, ...props }: BadgeProps) {
  const clickableExplicitlySet = props.clickable !== undefined;
  return (
    <Chip
      label={label}
      clickable={clickableExplicitlySet ? false : true}
      className={`BadgeChip ${isActivated ? 'BadgeChipActivated' : ''}`}
      {...props}
      sx={{
        backgroundColor: isActivated ? 'grey.900' : 'grey.300',
        color: isActivated ? 'white' : 'black',
        textShadow: isActivated ? '.001em .001em #fff' : 'none',
        '&:hover': clickableExplicitlySet
          ? {}
          : { backgroundColor: isActivated ? 'grey.600' : 'grey.400' },
        // focusVisible is set in app.scss
      }}
    />
  );
}
