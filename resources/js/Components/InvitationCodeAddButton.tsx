import { useForm } from '@inertiajs/react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { IconButton, Tooltip } from '@mui/material';

export function InvitationCodeAddButton() {
  const { post } = useForm({});

  const postRequestToCreateNewInvitationCode = () => {
    post('/invitation-codes');
  };

  return (
    <Tooltip
      title={
        <>
          Einen neuen Einladungscode hinzufügen, um einen neuen User einzuladen.
        </>
      }
      placement="right"
      arrow
    >
      <IconButton
        onClick={postRequestToCreateNewInvitationCode}
        sx={{ padding: 0 }}
      >
        <AddCircleIcon />
      </IconButton>
    </Tooltip>
  );
}
