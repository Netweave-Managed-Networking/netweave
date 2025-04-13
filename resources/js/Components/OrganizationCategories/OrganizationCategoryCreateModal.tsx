import {
  storeOrganizationCategory,
  StoreOrganizationCategoryError,
  StoreOrganizationCategoryErrors,
} from '@/axios/storeOrganizationCategory.axios';
import { capitalizeInputWords } from '@/helpers/capitalizeInputWords.helper';
import {
  emptyOrganizationCategory,
  OrganizationCategoryCreate,
  orgCatMax,
} from '@/types/organization-category-create.model';
import { OrganizationCategory } from '@/types/organization-category.model';
import { useCallback, useEffect, useState } from 'react';
import InputError from '../Input/InputError';
import InputLabel from '../Input/InputLabel';
import PrimaryButton from '../Input/PrimaryButton';
import SecondaryButton from '../Input/SecondaryButton';
import TextArea from '../Input/TextArea';
import TextInput from '../Input/TextInput';
import { MaxTextSize } from '../Util/MaxTextSize';
import Modal from '../Util/Modal';

export type OrganizationCategoryCreateModalProps = {
  show: boolean;
  onClose: (newCategory: OrganizationCategory | undefined) => void;
};

export function OrganizationCategoryCreateModal({
  show,
  onClose,
}: OrganizationCategoryCreateModalProps) {
  const [categoryToCreate, setCategoryToCreate] =
    useState<OrganizationCategoryCreate>(emptyOrganizationCategory);
  const [processing, setProcessing] = useState<boolean>(false);
  const [errors, setErrors] = useState<StoreOrganizationCategoryErrors>({});

  useEffect(() => setCategoryToCreate(emptyOrganizationCategory), [show]); // reset on modal reopen

  const hasName = () => !!categoryToCreate.name.trim();
  const hasDescription = () => !!categoryToCreate.description?.trim();

  const postCategory = useCallback(async (): Promise<
    OrganizationCategory | 'error'
  > => {
    setProcessing(true);
    if (!hasName()) {
      setErrors({ name: '"Name" darf nicht leer sein.' });
      return 'error';
    }
    try {
      return await storeOrganizationCategory(categoryToCreate);
    } catch (error: unknown) {
      const e = error as StoreOrganizationCategoryError;
      setErrors(e.response?.data.errors ?? {});
      return 'error';
    } finally {
      setProcessing(false);
    }
  }, [categoryToCreate]);

  const submit = useCallback(async () => {
    const newCategory = await postCategory();
    if (newCategory !== 'error') onClose(newCategory);
  }, [postCategory]);

  return (
    <Modal
      show={show}
      onClose={() => onClose(undefined)}
      closeable={!hasName() && !hasDescription()}
    >
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900">
          Neue Organisationskategorie erstellen
        </h2>

        <div className="space-y-6">
          {/* Category Name */}
          <div>
            <div className="flex justify-between align-end">
              <InputLabel htmlFor="name" value="Name" required />
              <MaxTextSize value={categoryToCreate.name} max={orgCatMax.name} />
            </div>
            <TextInput
              id="name"
              required
              isFocused={true}
              value={categoryToCreate.name}
              onChange={e => {
                setErrors({});
                const name = capitalizeInputWords(e);
                setCategoryToCreate({ ...categoryToCreate, name });
              }}
              className="mt-1 block w-full"
            />
            <InputError message={errors.name} className="mt-2" />
          </div>

          {/* Category Description */}
          <div>
            <div className="flex justify-between align-end">
              <InputLabel htmlFor="description" value="Beschreibung" />
              <MaxTextSize
                value={categoryToCreate.description}
                max={orgCatMax.description}
              />
            </div>
            <TextArea
              id="description"
              value={categoryToCreate.description}
              onChange={e =>
                setCategoryToCreate({
                  ...categoryToCreate,
                  description: e.target.value,
                })
              }
              className="mt-1 block w-full"
            />
            <InputError message={errors.description} className="mt-2" />
          </div>

          <div className="mt-6 flex justify-end">
            <SecondaryButton onClick={() => onClose(undefined)}>
              Abbrechen
            </SecondaryButton>
            <PrimaryButton
              className="ms-3"
              onClick={submit}
              disabled={!hasName() || processing}
            >
              Erstellen
            </PrimaryButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}
