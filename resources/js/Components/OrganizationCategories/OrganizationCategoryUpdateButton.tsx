import InputError from '@/Components/Input/InputError';
import InputLabel from '@/Components/Input/InputLabel';
import PrimaryButton from '@/Components/Input/PrimaryButton';
import SecondaryButton from '@/Components/Input/SecondaryButton';
import TextInput from '@/Components/Input/TextInput';
import Modal from '@/Components/Util/Modal';
import { OrganizationCategory } from '@/types/organization-category.model';
import { useForm } from '@inertiajs/react';
import EditOutlined from '@mui/icons-material/EditOutlined';
import { Button, Tooltip } from '@mui/material';
import { CSSProperties, FormEventHandler, useState } from 'react';
import TextArea from '../Input/TextArea';

interface OrganizationCategoryUpdateButtonProps {
  category: OrganizationCategory;
  className?: string;
  style?: CSSProperties;
}

export function OrganizationCategoryUpdateButton({
  category,
  className,
  style,
}: OrganizationCategoryUpdateButtonProps) {
  const { data, setData, put, errors, processing } = useForm({
    name: category.name,
    description: category.description ?? '',
  });
  const [showModal, setShowModal] = useState(false);

  const handleSubmit: FormEventHandler = e => {
    e.preventDefault();
    put(route('organization-categories.update', category.id), {
      onSuccess: () => setShowModal(false),
    });
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <>
      <Tooltip title="Organisationskategorie bearbeiten" placement="top">
        <Button
          className={className}
          style={{ ...style, borderRadius: '0px' }}
          onClick={openModal}
        >
          <EditOutlined className="text-yellow-800" />
        </Button>
      </Tooltip>

      <Modal show={showModal} onClose={closeModal}>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">
            Organisationskategorie bearbeiten
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <InputLabel htmlFor="name" value="Name" required />
              <TextInput
                id="name"
                value={data.name}
                onChange={e => setData('name', e.target.value)}
                required
                className="mt-1 block w-full"
              />
              <InputError message={errors.name} className="mt-2" />
            </div>

            <div>
              <InputLabel htmlFor="description" value="Beschreibung" />
              <TextArea
                id="description"
                value={data.description}
                rows={10}
                onChange={e => setData('description', e.target.value)}
                className="mt-1 block w-full"
              />
              <InputError message={errors.description} className="mt-2" />
            </div>

            <div className="mt-6 flex justify-end">
              <SecondaryButton onClick={closeModal}>Abbrechen</SecondaryButton>
              <PrimaryButton
                className="ms-3"
                type="submit"
                disabled={processing}
              >
                Speichern
              </PrimaryButton>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
