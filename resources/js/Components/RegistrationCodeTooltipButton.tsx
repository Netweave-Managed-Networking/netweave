import { infoMail } from '@/const/email.const';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { IconButton, Tooltip } from '@mui/material';

export function RegistrationCodeTooltipButton() {
  return (
    <Tooltip
      title={
        <>
          <p>
            Ein <strong>Registrierungs-Code</strong> wird benötigt, um sich bei
            Netweave zu registrieren.
          </p>
          <p>
            Für weitere Informationen schreibe einfach eine kurze E-Mail an{' '}
            <a className="text-blue-100" href={`mailto:${infoMail}`}>
              {infoMail}
            </a>
            . Wir helfen gerne weiter!
          </p>
        </>
      }
      placement="right-end"
      arrow
    >
      <IconButton>
        <HelpOutlineIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
