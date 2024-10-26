import { idNameToIdLabel } from '@/helpers/idNameToIdLabel.helper';
import { useStakeholderOrganizations } from '@/hooks/useStakeholderOrganizations.hook';
import Badge from './Badge';
import { LoadingDots } from './LoadingDots';
import { Tile } from './Tile';

export default function StakeholderOrganizationsList() {
  const { stakeholderOrganizations, isLoading, isError } =
    useStakeholderOrganizations();

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

  if (stakeholderOrganizations.length === 0) {
    return (
      <Tile>
        Es existieren keine Organisationen oder es wurden keine gefunden.
      </Tile>
    );
  }

  return (
    <ul>
      {stakeholderOrganizations.map((organization, index) => (
        <div key={organization.id} className={index === 0 ? 'pb-3' : 'py-3'}>
          <Tile>
            <strong>{organization.name}</strong>
            {organization.stakeholder_categories.map(category => (
              <Badge
                key={category.id}
                element={idNameToIdLabel(category)}
              ></Badge>
            ))}
          </Tile>
        </div>
      ))}
    </ul>
  );
}
