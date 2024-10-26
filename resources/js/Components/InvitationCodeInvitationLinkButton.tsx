import { copyToClipboard } from '@/helpers/copyToClipboard.helper';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IconButton, Tooltip } from '@mui/material';
import { useState } from 'react';
import Toast from './Toast';

interface InvitationCodeInvitationLinkButtonProps {
  code: string;
}

export default function InvitationCodeInvitationLinkButton({
  code,
}: InvitationCodeInvitationLinkButtonProps) {
  const [toastOpen, setToastOpen] = useState(false);

  const copyLinkToClipboard = () => {
    const invitationLink = `${window.location.origin}/register?code=${code}`;
    copyToClipboard(invitationLink);
  };

  const showToastMessage = () => {
    setToastOpen(true);
    setTimeout(() => setToastOpen(false), 2000);
  };

  return (
    <>
      <Tooltip title="Einladungslink kopieren" placement="right" arrow>
        <IconButton
          onClick={() => {
            copyLinkToClipboard();
            showToastMessage();
          }}
          sx={{ padding: 0 }}
        >
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Toast
        open={toastOpen}
        message="Der Einladungslink wurde in die Zwischenablage kopiert."
        position="top-center"
        severity="info"
      />
    </>
  );
}
