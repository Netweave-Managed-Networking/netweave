import InputError from '@/components/input/input-error';
import InputLabel from '@/components/input/input-label';
import PrimaryButton from '@/components/input/primary-button';
import SecondaryButton from '@/components/input/secondary-button';
import TextInput from '@/components/input/text-input';
import Modal from '@/components/util/modal';
import { orgCatMax } from '@/types/organization-category-create.model';
import { OrganizationCategory } from '@/types/organization-category.model';
import { useForm } from '@inertiajs/react';
import EditOutlined from '@mui/icons-material/EditOutlined';
import { Button, Tooltip, Typography } from '@mui/material';
import { CSSProperties, FormEventHandler, useState } from 'react';
import TextArea from '../input/text-area';
import { MaxTextSize } from '../util/max-text-size';

interface OrganizationCategoryUpdateButtonProps {
  category: OrganizationCategory;
  className?: string;
  style?: CSSProperties;
}

export function OrganizationCategoryUpdateButton({ category, className, style }: OrganizationCategoryUpdateButtonProps) {
  const { data, setData, put, errors, processing } = useForm({ ...category });
  const [showModal, setShowModal] = useState(false);

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    put(route('organization-categories.update', category.id), {
      onSuccess: () => closeModal(),
    });
  };

  const openModal = () => {
    setData({ ...category });
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  return (
    <>
      <Tooltip title={<Typography>Organisationskategorie bearbeiten</Typography>} placement="top">
        <Button className={className} style={{ ...style, borderRadius: '0px' }} onClick={openModal}>
          <EditOutlined className="text-yellow-800" />
        </Button>
      </Tooltip>

      <Modal show={showModal} onClose={closeModal}>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">Organisationskategorie bearbeiten</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="align-end flex justify-between">
                <InputLabel htmlFor="name" value="Name" required />
                <MaxTextSize value={data.name} max={orgCatMax.name} />
              </div>
              <TextInput id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required className="mt-1 block w-full" />
              <InputError message={errors.name} className="mt-2" />
            </div>

            <div>
              <div className="align-end flex justify-between">
                <InputLabel htmlFor="description" value="Beschreibung" />
                <MaxTextSize value={data.description} max={orgCatMax.description} />
              </div>
              <TextArea
                id="description"
                value={data.description ?? undefined}
                rows={10}
                onChange={(e) => setData('description', e.target.value)}
                className="mt-1 block w-full"
              />
              <InputError message={errors.description} className="mt-2" />
            </div>

            <div className="mt-6 flex justify-end">
              <SecondaryButton onClick={closeModal}>Abbrechen</SecondaryButton>
              <PrimaryButton className="ms-3" type="submit" disabled={processing}>
                Speichern
              </PrimaryButton>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
