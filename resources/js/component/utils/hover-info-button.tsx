import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoIcon from '@mui/icons-material/Info';
import { IconButton, Tooltip, TooltipProps, Typography } from '@mui/material';

export interface HoverInfoButtonProps {
  message: string | React.ReactNode;
  /** @default 'top' */
  placement?: TooltipProps['placement'];
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const HoverInfoButton = ({ message, placement, onClick }: HoverInfoButtonProps) => {
  return (
    <Tooltip title={<Typography>{message}</Typography>} placement={placement ?? 'top'}>
      <IconButton
        onClick={onClick}
        sx={{
          padding: 0,
          ...(onClick ? { cursor: 'pointer' } : {}),
        }}
      >
        {onClick ? <InfoIcon className="text-gray-800" /> : <HelpOutlineIcon className="text-gray-800" sx={{ cursor: 'default' }} />}
      </IconButton>
    </Tooltip>
  );
};

export default HoverInfoButton;
