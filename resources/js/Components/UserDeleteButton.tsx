import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { UserMin } from '@/types/user-min.model';
import { useForm } from '@inertiajs/react';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { IconButton, Tooltip } from '@mui/material';
import { useState } from 'react';

interface UserDeleteButtonProps {
  user: UserMin;
}

export function UserDeleteButton({ user }: UserDeleteButtonProps) {
  const { delete: destroy } = useForm({});
  const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    setLoading(true);

    destroy(route('users.destroy', user.id), {
      preserveScroll: true,
      onSuccess: () => closeModal(),
      onFinish: () => setLoading(false),
    });
  };

  const closeModal = () => {
    setConfirmingUserDeletion(false);
  };

  return (
    <>
      <Tooltip title="Dialog öffnen, um User zu löschen" placement="top">
        <IconButton
          onClick={() => setConfirmingUserDeletion(true)}
          sx={{ padding: 0 }}
        >
          <PersonRemoveIcon fontSize="small" className="text-red-700" />
        </IconButton>
      </Tooltip>

      <Modal show={confirmingUserDeletion} onClose={closeModal}>
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">Bist du sicher?</h2>
          <p className="mt-1 text-sm text-gray-600">
            Bist du sicher, dass du das Profil von{' '}
            <strong> &quot;{user.name}&quot;</strong> <em>{user.email}</em>{' '}
            löschen möchtest?
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {user.name} wird sich nicht wieder einloggen können.
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Neben den persönlichen Daten sowie den Zugangsdaten der Nutzerin /
            des Nutzers, werden keine weiteren Daten gelöscht.
          </p>
          <div className="mt-6 flex justify-end">
            <SecondaryButton onClick={closeModal}>Abbrechen</SecondaryButton>
            <DangerButton
              className="ms-3"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Wird Gelöscht...' : 'Löschen'}
            </DangerButton>
          </div>
        </div>
      </Modal>
    </>
  );
}
