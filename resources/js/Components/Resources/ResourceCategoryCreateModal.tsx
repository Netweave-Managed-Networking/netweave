import {
  StoreResourceCategoryError,
  StoreResourceCategoryErrors,
  storeResourceCategory,
} from '@/axios/storeResourceCategory.axios';
import { capitalizeWords } from '@/helpers/capitalizeWords.helper';
import { ResourceCategoryCreate } from '@/types/resource-category-create.model';
import { ResourceCategory } from '@/types/resource-category.model';
import { useCallback, useEffect, useState } from 'react';
import InputError from '../Input/InputError';
import InputLabel from '../Input/InputLabel';
import PrimaryButton from '../Input/PrimaryButton';
import SecondaryButton from '../Input/SecondaryButton';
import TextArea from '../Input/TextArea';
import TextInput from '../Input/TextInput';
import Modal from '../Util/Modal';

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
    <Modal show={show} onClose={() => onClose(undefined)}>
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900">
          Neue Ressourcenkategorie erstellen
        </h2>

        <div className="space-y-6">
          {/* Category Name */}
          <div>
            <InputLabel htmlFor="title" value="Titel" required />
            <TextInput
              id="title"
              required
              isFocused={true}
              value={categoryToCreate.title}
              onChange={e => {
                setErrors({});
                const title = capitalizeWords(e.target.value);
                e.target.value = title;
                setCategoryToCreate({ ...categoryToCreate, title });
              }}
              className="mt-1 block w-full"
            />
            <InputError message={errors.title} className="mt-2" />
          </div>

          {/* Category Definition */}
          <div>
            <InputLabel htmlFor="definition" value="Definition" />
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
