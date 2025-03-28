import { infoMail } from '@/constants/email.const';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { IconButton, Tooltip, Typography } from '@mui/material';

export function InvitationCodeTooltipButton() {
  return (
    <Tooltip
      title={
        <Typography>
          <p>
            Ein <strong>Einladungscode</strong> wird benötigt, um sich bei
            Netweave zu registrieren.
            <br />
            <br />
          </p>
          <p>
            Für weitere Informationen schreibe einfach eine kurze E-Mail an{' '}
            <a className="text-blue-100" href={`mailto:${infoMail}`}>
              {infoMail}
            </a>
            .
            <br />
            <br />
          </p>
          <p>Wir helfen gerne weiter!</p>
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
