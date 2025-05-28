import { infoMail } from '@/constants/email.const';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { IconButton, Tooltip, Typography } from '@mui/material';

export function InvitationCodeTooltipButton() {
  return (
    <Tooltip
      title={
        <Typography>
          <span>
            Ein <strong>Einladungscode</strong> wird benötigt, um sich bei Netweave zu registrieren.
            <br />
            <br />
          </span>
          <span>
            Für weitere Informationen, schreib' einfach eine kurze E-Mail an{' '}
            <a className="text-blue-100" href={`mailto:${infoMail}`}>
              {infoMail}
            </a>
            .
            <br />
            <br />
          </span>
          <span>Wir helfen gerne weiter!</span>
        </Typography>
      }
      placement="right-end"
      arrow
    >
      <IconButton sx={{ padding: 0, paddingLeft: '8px' }}>
        <HelpOutlineIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
