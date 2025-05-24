import { useForm } from '@inertiajs/react';
import BackspaceIcon from '@mui/icons-material/Backspace';
import { IconButton, Tooltip, Typography } from '@mui/material';

interface InvitationCodeDeleteButtonProps {
  id: number;
}

export function InvitationCodeDeleteButton({
  id,
}: InvitationCodeDeleteButtonProps) {
  const { delete: destroy } = useForm({});

  const handleDelete = async () => {
    try {
      destroy(route('invitation-codes.destroy', id));
    } catch (error) {
      console.error('Error deleting invitation code:', error);
    }
  };

  return (
    <Tooltip title={<Typography>Löschen</Typography>} placement="right">
      <IconButton onClick={handleDelete} sx={{ padding: 0 }}>
        <BackspaceIcon fontSize="small" className="text-red-700" />
      </IconButton>
    </Tooltip>
  );
}
