import { useForm } from '@inertiajs/react';
import BackspaceIcon from '@mui/icons-material/Backspace';
import { IconButton, Tooltip } from '@mui/material';

interface RegistrationCodeDeleteButtonProps {
  id: number;
}

export function RegistrationCodeDeleteButton({
  id,
}: RegistrationCodeDeleteButtonProps) {
  const { delete: httpDelete } = useForm({});

  const handleDelete = async () => {
    try {
      httpDelete(route('registration-codes.destroy', id));
    } catch (error) {
      console.error('Error deleting registration code:', error);
    }
  };

  return (
    <Tooltip title="Löschen" placement="right">
      <IconButton onClick={handleDelete} sx={{ padding: 0 }}>
        <BackspaceIcon fontSize="small" className="text-red-700" />
      </IconButton>
    </Tooltip>
  );
}
