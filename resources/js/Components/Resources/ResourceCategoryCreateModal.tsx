import { storeResourceCategory, StoreResourceCategoryError, StoreResourceCategoryErrors } from '@/axios/storeResourceCategory.axios';
import { capitalizeInputWords } from '@/helpers/capitalizeInputWords.helper';
import { resCatMax, ResourceCategoryCreate } from '@/types/resource-category-create.model';
import { ResourceCategory } from '@/types/resource-category.model';
import { useCallback, useEffect, useState } from 'react';
import InputError from '../Input/InputError';
import InputLabel from '../Input/InputLabel';
import PrimaryButton from '../Input/PrimaryButton';
import SecondaryButton from '../Input/SecondaryButton';
import TextArea from '../Input/TextArea';
import TextInput from '../Input/TextInput';
import { MaxTextSize } from '../Util/MaxTextSize';
import Modal from '../Util/Modal';

export type ResourceCategoryCreateModalProps = {
  show: boolean;
  onClose: (newCategory: ResourceCategory | undefined) => void;
};

export function ResourceCategoryCreateModal({ show, onClose }: ResourceCategoryCreateModalProps) {
  const [categoryToCreate, setCategoryToCreate] = useState<ResourceCategoryCreate>({ title: '' });
  const [processing, setProcessing] = useState<boolean>(false);
  const [errors, setErrors] = useState<StoreResourceCategoryErrors>({});

  useEffect(() => setCategoryToCreate({ title: '' }), [show]); // reset on modal reopen

  const hasTitle = useCallback(() => !!categoryToCreate.title.trim(), [categoryToCreate]);
  const hasDefinition = useCallback(() => !!categoryToCreate.definition?.trim(), [categoryToCreate]);

  const postCategory = useCallback(async (): Promise<ResourceCategory | 'error'> => {
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
  }, [categoryToCreate, hasTitle]);

  const submit = useCallback(async () => {
    const newCategory = await postCategory();
    if (newCategory !== 'error') onClose(newCategory);
  }, [onClose, postCategory]);

  return (
    <Modal show={show} onClose={() => onClose(undefined)} closeable={!hasTitle() && !hasDefinition()}>
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900">Neue Ressourcenkategorie erstellen</h2>

        <div className="space-y-6">
          {/* Category Name */}
          <div>
            <div className="align-end flex justify-between">
              <InputLabel htmlFor="title" value="Titel" required />
              <MaxTextSize value={categoryToCreate.title} max={resCatMax.title} />
            </div>
            <TextInput
              id="title"
              required
              isFocused={true}
              value={categoryToCreate.title}
              onChange={(e) => {
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
            <div className="align-end flex justify-between">
              <InputLabel htmlFor="definition" value="Definition" />
              <MaxTextSize value={categoryToCreate.definition} max={resCatMax.definition} />
            </div>
            <TextArea
              id="definition"
              value={categoryToCreate.definition}
              onChange={(e) =>
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
            <SecondaryButton onClick={() => onClose(undefined)}>Abbrechen</SecondaryButton>
            <PrimaryButton className="ms-3" onClick={submit} disabled={!hasTitle() || processing}>
              Erstellen
            </PrimaryButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}
