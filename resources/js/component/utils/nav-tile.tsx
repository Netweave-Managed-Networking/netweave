import { ArrowForwardIos } from '@mui/icons-material';
import { ReactNode } from 'react';
import { Tile } from './tile';

export function NavTile({
  title,
  href,
  icon,
}: {
  title: string;
  href: string;
  icon?: ReactNode;
}) {
  return (
    <a href={href}>
      <Tile>
        <span className="w-full flex justify-between">
          <span className="flex justify-between gap-2">
            {icon} <span>{title}</span>
          </span>
          <span>
            <ArrowForwardIos fontSize="medium" />
          </span>
        </span>
      </Tile>
    </a>
  );
}
