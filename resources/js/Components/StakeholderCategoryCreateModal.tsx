import {
  StoreStakeholderCategoryError,
  StoreStakeholderCategoryErrors,
  storeStakeholderCategory,
} from '@/axios/storeStakeholderCategory.axios';
import { StakeholderCategoryCreate } from '@/types/stakeholder-category-create.model';
import { StakeholderCategory } from '@/types/stakeholder-category.model';
import { useCallback, useState } from 'react';
import InputError from './InputError';
import InputLabel from './InputLabel';
import Modal from './Modal';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';
import TextArea from './TextArea';
import TextInput from './TextInput';

export type StakeholderCategoryCreateModalProps = {
  show: boolean;
  onClose: (newCategory: StakeholderCategory | undefined) => void;
};

export function StakeholderCategoryCreateModal({
  show,
  onClose,
}: StakeholderCategoryCreateModalProps) {
  const [categoryToCreate, setCategoryToCreate] =
    useState<StakeholderCategoryCreate>({ name: '' });
  const [processing, setProcessing] = useState<boolean>(false);
  const [errors, setErrors] = useState<StoreStakeholderCategoryErrors>({});

  const hasName = () => !!categoryToCreate.name.trim();

  const postCategory = useCallback(async (): Promise<
    StakeholderCategory | 'error'
  > => {
    setProcessing(true);
    if (!hasName()) {
      setErrors({ name: '"Name" darf nicht leer sein.' });
      return 'error';
    }
    try {
      return await storeStakeholderCategory(categoryToCreate);
    } catch (error: unknown) {
      const e = error as StoreStakeholderCategoryError;
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
          Neue Kategorie erstellen
        </h2>

        <div className="space-y-6">
          {/* Category Name */}
          <div>
            <InputLabel htmlFor="name" value="Name" required />
            <TextInput
              id="name"
              required
              isFocused={true}
              onChange={e => {
                setErrors({});
                const name = capitalizeWords(e.target.value);
                e.target.value = name;
                setCategoryToCreate({ ...categoryToCreate, name });
              }}
              className="mt-1 block w-full"
            />
            <InputError message={errors.name} className="mt-2" />
          </div>

          {/* Category Description */}
          <div>
            <InputLabel htmlFor="description" value="Beschreibung" />
            <TextArea
              id="description"
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

const capitalizeWords = (sentence: string) =>
  sentence.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
