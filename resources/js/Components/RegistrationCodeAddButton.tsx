import { useForm } from '@inertiajs/react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { IconButton, Tooltip } from '@mui/material';

export function RegistrationCodeAddButton() {
  const { post } = useForm({});

  const postRequestToCreateNewRegistrationCode = () => {
    post('/registration-codes');
  };

  return (
    <Tooltip
      title={
        <>
          Einen neuen Registrierungscode hinzufügen, um einen neuen User
          einzuladen.
        </>
      }
      placement="right"
      arrow
    >
      <IconButton onClick={postRequestToCreateNewRegistrationCode}>
        <AddCircleIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
