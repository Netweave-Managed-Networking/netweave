import { OrganizationCategory } from '@/types/organization-category.model';
import { AddOutlined } from '@mui/icons-material';
import { Button, Tooltip } from '@mui/material';
import { useState } from 'react';
import { OrganizationCategoryCreateModal } from './OrganizationCategoryCreateModal';

export type OrganizationCategoryAddProps = {
  onOrganizationCategoryAdd: (
    newCategory: OrganizationCategory | undefined
  ) => void;
};

export default function OrganizationCategoryAdd({
  onOrganizationCategoryAdd,
}: OrganizationCategoryAddProps) {
  const [modalIsActive, setModalIsActive] = useState<boolean>(false);
  const showModal = () => setModalIsActive(true);
  const hideModal = () => setModalIsActive(false);

  return (
    <div
      key="createNewOrganizationCategory"
      className="bg-white m-3 shadow-sm sm:rounded-lg flex justify-between"
    >
      <div className="px-6 py-6">
        <code className="italic">Kategorie hinzufügen</code>
      </div>
      <div className="grid" style={{ borderLeft: '1px solid #e5e5e5' }}>
        <Tooltip title="Organisationskategorie hinzufügen" placement="bottom">
          <Button
            className={'text-green-800'}
            style={{ borderRadius: '0px' }}
            onClick={showModal}
          >
            <AddOutlined className="text-yellow-800" />
          </Button>
        </Tooltip>

        <OrganizationCategoryCreateModal
          show={modalIsActive}
          onClose={category => {
            if (category) onOrganizationCategoryAdd(category);
            hideModal();
          }}
        />
      </div>
    </div>
  );
}
