import {
  storeResourceCategory,
  StoreResourceCategoryError,
  StoreResourceCategoryErrors,
} from '@/axios/storeResourceCategory.axios';
import { capitalizeInputWords } from '@/helpers/capitalize-input-words.helper';
import {
  resCatMax,
  ResourceCategoryCreate,
} from '@/types/resource-category-create.model';
import { ResourceCategory } from '@/types/resource-category.model';
import { useCallback, useEffect, useState } from 'react';
import InputError from '../input/input-error';
import InputLabel from '../input/input-label';
import PrimaryButton from '../input/primary-button';
import SecondaryButton from '../input/secondary-button';
import TextArea from '../input/text-area';
import TextInput from '../input/text-input';
import { MaxTextSize } from '../util/max-text-size';
import Modal from '../util/modal';

export type ResourceCategoryCreateModalProps = {
  show: boolean;
  onClose: (newCategory: ResourceCategory | undefined) => void;
};

export function ResourceCategoryCreateModal({
  show,
  onClose,
}: ResourceCategoryCreateModalProps) {
  const [categoryToCreate, setCategoryToCreate] =
    useState<ResourceCategoryCreate>({ title: '' });
  const [processing, setProcessing] = useState<boolean>(false);
  const [errors, setErrors] = useState<StoreResourceCategoryErrors>({});

  useEffect(() => setCategoryToCreate({ title: '' }), [show]); // reset on modal reopen

  const hasTitle = () => !!categoryToCreate.title.trim();
  const hasDefinition = () => !!categoryToCreate.definition?.trim();

  const postCategory = useCallback(async (): Promise<
    ResourceCategory | 'error'
  > => {
    setProcessing(true);
    if (!hasTitle()) {
      setErrors({ title: '"Titel" darf nicht leer sein.' });
      return 'error';
    }
    try {
      return await storeResourceCategory(categoryToCreate);
    } catch (error: unknown) {
      const e = error as StoreResourceCategoryError;
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
      closeable={!hasTitle() && !hasDefinition()}
    >
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900">
          Neue Ressourcenkategorie erstellen
        </h2>

        <div className="space-y-6">
          {/* Category Name */}
          <div>
            <div className="flex justify-between align-end">
              <InputLabel htmlFor="title" value="Titel" required />
              <MaxTextSize
                value={categoryToCreate.title}
                max={resCatMax.title}
              />
            </div>
            <TextInput
              id="title"
              required
              isFocused={true}
              value={categoryToCreate.title}
              onChange={e => {
                setErrors({});
                const title = capitalizeInputWords(e);
                setCategoryToCreate({ ...categoryToCreate, title });
              }}
              className="mt-1 block w-full"
            />
            <InputError message={errors.title} className="mt-2" />
          </div>

          {/* Category Definition */}
          <div>
            <div className="flex justify-between align-end">
              <InputLabel htmlFor="definition" value="Definition" />
              <MaxTextSize
                value={categoryToCreate.definition}
                max={resCatMax.definition}
              />
            </div>
            <TextArea
              id="definition"
              value={categoryToCreate.definition}
              onChange={e =>
                setCategoryToCreate({
                  ...categoryToCreate,
                  definition: e.target.value,
                })
              }
              className="mt-1 block w-full"
            />
            <InputError message={errors.definition} className="mt-2" />
          </div>

          <div className="mt-6 flex justify-end">
            <SecondaryButton onClick={() => onClose(undefined)}>
              Abbrechen
            </SecondaryButton>
            <PrimaryButton
              className="ms-3"
              onClick={submit}
              disabled={!hasTitle() || processing}
            >
              Erstellen
            </PrimaryButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}
