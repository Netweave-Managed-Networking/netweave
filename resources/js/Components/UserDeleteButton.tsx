import { useForm } from '@inertiajs/react';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { IconButton, Tooltip } from '@mui/material';

interface UserDeleteButtonProps {
  id: number;
}

export function UserDeleteButton({ id }: UserDeleteButtonProps) {
  const { delete: destroy } = useForm({});

  const handleDelete = async () => {
    try {
      destroy(route('users.destroy', id));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <Tooltip title="Löschen" placement="right">
      <IconButton onClick={handleDelete} sx={{ padding: 0 }}>
        <PersonRemoveIcon fontSize="small" className="text-red-700" />
      </IconButton>
    </Tooltip>
  );
}
