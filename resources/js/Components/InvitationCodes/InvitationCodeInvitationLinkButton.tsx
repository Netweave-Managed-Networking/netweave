import { copyToClipboard } from '@/helpers/copyToClipboard.helper';
import { useToast } from '@/Providers/ToastProvider';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IconButton, Tooltip, Typography } from '@mui/material';

interface InvitationCodeInvitationLinkButtonProps {
  code: string;
}

export default function InvitationCodeInvitationLinkButton({
  code,
}: InvitationCodeInvitationLinkButtonProps) {
  const { showToast } = useToast();

  const copyLinkToClipboard = () => {
    const invitationLink = `${window.location.origin}/register?code=${code}`;
    copyToClipboard(invitationLink);
  };

  const showToastMessage = () => {
    showToast(
      'Der Einladungslink wurde in die Zwischenablage kopiert.',
      'info',
      { v: 'top', h: 'center' }
    );
  };

  return (
    <>
      <Tooltip
        title={<Typography>Einladungslink kopieren</Typography>}
        placement="right"
        arrow
      >
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
    </>
  );
}
