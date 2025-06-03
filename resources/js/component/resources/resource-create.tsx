import InputError from '@/component/inputs/input-error';
import InputLabel from '@/component/inputs/input-label';
import PrimaryButton from '@/component/inputs/primary-button';
import SecondaryButton from '@/component/inputs/secondary-button';
import TextArea from '@/component/inputs/text-area';
import TextInput from '@/component/inputs/text-input';
import ResourceCategoriesSelectAdd from '@/component/resources/resource-categories-select-add';
import ResourceRequirementToggle from '@/component/resources/resource-requirement-toggle';
import HPItemsInfoModalButton from '@/component/utils/hp-items-info-modal-button';
import { readRedirectToFromHTMLButtonName } from '@/helpers/read-redirect-to-from-html-button-name.helper';
import { OrganizationMin } from '@/types/organization-min.model';
import { ResourceCategory } from '@/types/resource-category.model';
import { emptyResource, ResourceCreate as ResourceCreateModel, resourceMax } from '@/types/resource-create.model';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, SyntheticEvent, useState } from 'react';
import { MaxTextSize } from '../utils/max-text-size';

export interface ResourceCreateProps {
  organization: OrganizationMin;
  resourceCategories: ResourceCategory[];
}

export function ResourceCreate({ organization, resourceCategories }: ResourceCreateProps) {
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const { data, setData, post, errors, processing } = useForm<ResourceCreateModel>(emptyResource(organization.id));

  const handleSubmit: FormEventHandler = (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    const redirectTo = readRedirectToFromHTMLButtonName(e.nativeEvent.submitter as HTMLButtonElement);
    data.resource_categories = selectedCategories;
    post(
      route('resources.store', {
        organization: organization.id,
        redirect_to: redirectTo,
      }),
      {
        onSuccess: () => {
          setData(emptyResource(organization.id));
          setSelectedCategories([]);
        },
      },
    );
  };

  const getLabel2 = (): string => {
    return data.type ? (data.type === 'requirement' ? 'eines Bedarfs' : 'einer Ressource') : 'einer Ressource oder eines Bedarfs';
  };

  const getLabel3 = (): string => {
    return data.type ? (data.type === 'requirement' ? 'des Bedarfs' : 'der Ressource') : 'der Ressource oder des Bedarfs';
  };

  return (
    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
      <div className="border-b border-gray-200 bg-white p-6">
        <form onSubmit={handleSubmit} onKeyDown={(e) => (e.key === 'Enter' ? e.preventDefault() : void 0)} className="space-y-6">
          <div
            style={{
              display: 'grid',
              gridTemplateRows: 'auto 250px auto',
              gridTemplateColumns: 'minmax(100px, 90%) minmax(100px, 10%)',
              gridTemplateAreas: `
                      'desc-label type-label'
                      'desc-text type-toggler'
                      'desc-error type-error'
                      `,
              rowGap: '8px',
            }}
          >
            {/* Resource description */}
            <div style={{ gridArea: 'desc-label' }}>
              <div className="align-end flex justify-between">
                <InputLabel
                  required
                  htmlFor="description"
                  value={`Ausführliche Beschreibung ${getLabel2()} (wird für analytische Auswertung verwendet)`}
                />
                <MaxTextSize value={data.description} max={resourceMax.description} />
              </div>
            </div>
            <div style={{ gridArea: 'desc-text' }}>
              <TextArea
                id="description"
                required
                autoFocus
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                style={{
                  resize: 'none',
                  borderColor: errors.description ? '#f00' : '#ccc',
                  borderRadius: '8px 0px 0px 8px',
                  height: '100%',
                  width: '100%',
                }}
              />
            </div>
            <div style={{ gridArea: 'desc-error' }}>
              <InputError message={errors.description} />
            </div>

            {/* Resource type */}
            <div style={{ gridArea: 'type-label' }} className="flex justify-end">
              <InputLabel htmlFor="Typ" required />
            </div>
            <div style={{ gridArea: 'type-toggler' }}>
              <ResourceRequirementToggle
                style={{
                  borderRadius: '0px 8px 8px 0px',
                  border: `1px solid ${errors.type ? '#f00' : '#ccc'}`,
                  borderLeft: 'none',
                }}
                value={data['type']}
                onChange={(selected) => setData('type', selected)}
              />
            </div>
            <div style={{ gridArea: 'type-error' }}>{errors.type && <InputError message={'Ressource oder Bedarf?'} />}</div>
          </div>
          {/* Resource summary */}
          <div>
            <div className="align-end flex justify-between">
              <InputLabel htmlFor="summary" value={`Kurze, stichpunktartige Kurzbeschreibung ${getLabel3()}`} />
              <MaxTextSize value={data.summary} max={resourceMax.summary} />
            </div>
            <TextInput id="summary" value={data.summary} onChange={(e) => setData('summary', e.target.value)} className="mt-1 block w-full" />
            <InputError message={errors.summary} className="mt-2" />
          </div>
          {/* Categories */}
          <InputLabel value="Kategorien" required />{' '}
          {errors.resource_categories && <InputError message="Wähle mindestens eine Ressourcenkategorie aus." />}
          <div className="flex">
            <span className="overflow-x-hidden overflow-y-auto">
              <ResourceCategoriesSelectAdd
                resourceCategories={resourceCategories}
                resourceCategoriesSelected={selectedCategories}
                onChange={(selected) => setSelectedCategories(selected)}
              />
            </span>
            <span>
              <HPItemsInfoModalButton
                infoButtonTooltip="Infos zu den Kategorien"
                modalTitle="Beschreibungen der Ressourcenkategorien"
                items={resourceCategories.map((cat) => ({
                  header: cat.title,
                  paragraph: cat.definition ?? '',
                }))}
              />
            </span>
          </div>
          <div className="mt-4 flex w-full justify-between">
            <span>
              <SecondaryButton
                className="mr-4"
                disabled={processing}
                type="button"
                onClick={() => (window.location.href = `/organizations/${organization.id}/restrictions,coop_criteria,notes/create`)}
              >
                Weiter ohne Ressource oder Bedarf
              </SecondaryButton>
            </span>
            <span>
              <PrimaryButton
                className="ml-4"
                disabled={processing}
                name={`redirect_to:/organizations/${organization.id}/resources/create`}
                type="submit"
              >
                Speichern & Weitere Ressource / Bedarf hinzufügen
              </PrimaryButton>
              <PrimaryButton
                className="ml-4"
                disabled={processing}
                name={`redirect_to:/organizations/${organization.id}/restrictions,coop_criteria,notes/create`}
                type="submit"
              >
                Speichern & Weiter
              </PrimaryButton>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
