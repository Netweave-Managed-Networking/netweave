import { fetchOrganizationCategory } from '@/axios/fetch-organization-category.axios';
import SecondaryButton from '@/component/inputs/secondary-button';
import Modal from '@/component/utils/modals';
import { IdName } from '@/types/id-name.model';
import { OrganizationCategory } from '@/types/organization-category.model';
import { useForm } from '@inertiajs/react';
import { DeleteOutline } from '@mui/icons-material';
import { Button, Tooltip, Typography } from '@mui/material';
import { CSSProperties, useState } from 'react';
import DangerButton from '../inputs/danger-button';

interface OrganizationCategoryDeleteButtonProps {
  category: OrganizationCategory;
  className?: string;
  style?: CSSProperties;
}

export function OrganizationCategoryDeleteButton({ category, className, style }: OrganizationCategoryDeleteButtonProps) {
  const { delete: destroy } = useForm({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [organizationsOfCat, setOrganizationsOfCat] = useState<IdName[]>([]);
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    setLoading(true);

    destroy(route('organization-categories.destroy', category.id), {
      preserveScroll: true,
      onSuccess: () => closeModal(),
      onFinish: () => setLoading(false),
    });
  };

  const openModal = async () => {
    await fetchCategoryWithOrgs();
    setShowConfirmModal(true);
  };

  const closeModal = () => {
    setShowConfirmModal(false);
  };

  const fetchCategoryWithOrgs = async () => {
    const organizationCategory = await fetchOrganizationCategory(category.id);
    setOrganizationsOfCat(organizationCategory?.organizations ?? []);
  };

  return (
    <>
      <Tooltip title={<Typography>Dialog öffnen, um Organisationskategorie zu löschen</Typography>} placement="bottom">
        <Button className={className} style={{ ...style, borderRadius: '0px' }} onClick={openModal}>
          <DeleteOutline className="text-red-800" />
        </Button>
      </Tooltip>

      <Modal show={showConfirmModal} onClose={closeModal}>
        <div className="p-6">
          {/* header */}
          <h2 className="text-lg font-medium text-gray-900">
            Kategorie "<code>{category.name}</code>" löschen?
          </h2>

          {/* text */}
          {organizationsOfCat.length > 0 ? (
            <>
              <p className="mt-1 text-sm text-gray-600">
                Beim Löschen wird diese Kategorie somit{' '}
                <strong>von allen {organizationsOfCat.length} Organisationen entfernt, denen diese zurzeit zugewiesen ist</strong>.
              </p>
              <div className="mt-1 text-sm text-gray-600">
                Diese sind {organizationsOfCat.length > 5 && <span>unter anderem</span>}:
                <ul className="my-4 list-disc px-10">
                  {organizationsOfCat.slice(0, 5).map((organization) => (
                    <li key={organization.id}>{organization.name}</li>
                  ))}
                  {organizationsOfCat.length > 5 && <li>...</li>}
                </ul>
              </div>
            </>
          ) : (
            <p className="mt-1 text-sm text-gray-600">
              Es gibt keine Organisationen mit dieser Kategorie. Das Löschen dieser Kategorie hat somit keine Auswirkungen auf Organisationen.
            </p>
          )}

          {/* buttons */}
          <div className="mt-6 flex justify-end">
            <SecondaryButton onClick={closeModal}>Abbrechen</SecondaryButton>
            <DangerButton className="ms-3" onClick={handleDelete} disabled={loading}>
              {loading ? 'Wird Gelöscht...' : 'Löschen'}
            </DangerButton>
          </div>
        </div>
      </Modal>
    </>
  );
}
