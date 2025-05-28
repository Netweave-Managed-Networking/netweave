import { useOrganizations } from '@/hooks/use-organizations.hook';
import Badge from '../utils/badge';
import { LoadingDots } from '../utils/loading-dots';
import { Tile } from '../utils/tile';

export default function OrganizationsList() {
  const { organizations, isLoading, isError } = useOrganizations();
  if (isLoading) {
    return (
      <Tile>
        Organisationen werden geladen
        <div style={{ width: '30px' }}>
          <LoadingDots />
        </div>
      </Tile>
    );
  }

  if (isError) {
    return <Tile>Fehler beim Laden der Organisationen.</Tile>;
  }

  if (organizations.length === 0) {
    return <Tile>Es existieren keine Organisationen oder es wurden keine gefunden.</Tile>;
  }

  return (
    <ul>
      {organizations.map((organization, index) => (
        <div key={organization.id} className={index === 0 ? 'pb-3' : 'py-3'}>
          <Tile>
            <div className="flex items-center gap-2">
              <strong>{organization.name}</strong>
              {organization.organization_categories.map((category) => (
                <Badge key={category.id} label={category.name} isActivated={false} clickable={false} />
              ))}
            </div>
          </Tile>
        </div>
      ))}
    </ul>
  );
}
