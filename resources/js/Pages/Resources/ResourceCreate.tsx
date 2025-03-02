import InputError from '@/Components/Input/InputError';
import InputLabel from '@/Components/Input/InputLabel';
import PrimaryButton from '@/Components/Input/PrimaryButton';
import SecondaryButton from '@/Components/Input/SecondaryButton';
import TextArea from '@/Components/Input/TextArea';
import TextInput from '@/Components/Input/TextInput';
import ResourceCategoriesSelect from '@/Components/Resources/ResourceCategoriesSelect';
import ResourceRequirementToggle from '@/Components/Resources/ResourceRequirementToggle';
import HPItemsInfoModalButton from '@/Components/Util/HPItemsInfoModalButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Organization } from '@/types/organization.model';
import { PageProps } from '@/types/page-props.type';
import { ResourceCategory } from '@/types/resource-category.model';
import { ResourceCreate as ResourceCreateModel } from '@/types/resource-create.model';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, SyntheticEvent, useState } from 'react';

const emptyResource: (
  organization_id: number
) => ResourceCreateModel = organization_id => ({
  type: null,
  description: '',
  summary: '',
  organization_id: organization_id,
  resource_categories: [],
});

export default function ResourceCreate({
  auth,
  organization,
  resourceCategories,
}: PageProps<{
  organization: Organization;
  resourceCategories: ResourceCategory[];
}>) {
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const { data, setData, post, errors, processing } =
    useForm<ResourceCreateModel>(emptyResource(organization.id));

  const handleSubmit: FormEventHandler = (
    e: SyntheticEvent<HTMLFormElement, SubmitEvent>
  ) => {
    e.preventDefault();

    const name = (e.nativeEvent.submitter as HTMLButtonElement).name;
    const redirectMatch = name.match(/^redirect_to:(\/[\w-\/\{\}]+)$/);
    const redirectTo = redirectMatch && redirectMatch[1];

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
      }
    );
  };

  const getLabel1 = (): string => {
    return data.type
      ? data.type === 'requirement'
        ? 'einen Bedarf'
        : 'eine Ressource'
      : 'eine Ressource oder einen Bedarf';
  };

  const getLabel2 = (): string => {
    return data.type
      ? data.type === 'requirement'
        ? 'eines Bedarfs'
        : 'einer Ressource'
      : 'einer Ressource oder eines Bedarfs';
  };

  const getLabel3 = (): string => {
    return data.type
      ? data.type === 'requirement'
        ? 'des Bedarfs'
        : 'der Ressource'
      : 'der Ressource oder des Bedarfs';
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          <em>{organization.name}</em> {getLabel1()} zuordnen
        </h2>
      }
    >
      <Head title="Add Resource or Requirement" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div
                  style={{
                    display: 'grid',
                    gridTemplateRows: 'auto 250px auto',
                    gridTemplateColumns:
                      'minmax(100px, 90%) minmax(100px, 10%)',
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
                    <InputLabel
                      required
                      htmlFor="description"
                      value={`Ausführliche Beschreibung ${getLabel2()} (wird für analytische Auswertung verwendet)`}
                    />
                  </div>
                  <div style={{ gridArea: 'desc-text' }}>
                    <TextArea
                      id="description"
                      required
                      autoFocus
                      value={data.description}
                      onChange={e => setData('description', e.target.value)}
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
                  <div style={{ gridArea: 'type-label' }}>
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
                      onChange={selected => setData('type', selected)}
                    />
                  </div>
                  <div style={{ gridArea: 'type-error' }}>
                    {errors.type && (
                      <InputError message={'Ressource oder Bedarf?'} />
                    )}
                  </div>
                </div>

                {/* Resource summary */}
                <div>
                  <InputLabel
                    htmlFor="summary"
                    value={`Kurze, stichpunktartige Kurzbeschreibung ${getLabel3()}`}
                  />
                  <TextInput
                    id="summary"
                    value={data.summary}
                    onChange={e => setData('summary', e.target.value)}
                    className="mt-1 block w-full"
                  />
                  <InputError message={errors.summary} className="mt-2" />
                </div>

                {/* Categories */}
                <InputLabel value="Kategorien" required />
                <div className="flex">
                  <span className="overflow-x-hidden overflow-y-auto">
                    <ResourceCategoriesSelect
                      resourceCategories={resourceCategories}
                      resourceCategoriesSelected={selectedCategories}
                      onChange={selected => setSelectedCategories(selected)}
                    />
                  </span>
                  <span>
                    <HPItemsInfoModalButton
                      infoButtonTooltip="Infos zu den Kategorien"
                      modalTitle="Beschreibungen der Ressourcen-Kategorien"
                      items={resourceCategories.map(cat => ({
                        header: cat.title,
                        paragraph: cat.definition ?? '',
                      }))}
                    />
                  </span>
                </div>
                {errors.resource_categories && (
                  <InputError message="Wähle mindestens eine Ressourcen-Kategorie aus." />
                )}

                <div className="flex justify-between mt-4 w-full">
                  <SecondaryButton
                    className="float-start"
                    disabled={processing}
                    type="button"
                    onClick={() => history.back()}
                  >
                    Abbrechen
                  </SecondaryButton>
                  <span>
                    <PrimaryButton
                      className="ml-4"
                      disabled={processing}
                      name="redirect_to:/home" // TODO redirect_to stakeholder detail page (not yet implemented)
                      type="submit"
                    >
                      Fertig
                    </PrimaryButton>
                    <PrimaryButton
                      className="ml-4"
                      disabled={processing}
                      name={`redirect_to:/organizations/${organization.id}/resources/create`}
                      type="submit"
                    >
                      Weitere Ressource oder weiteren Bedarf hinzufügen
                    </PrimaryButton>
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
