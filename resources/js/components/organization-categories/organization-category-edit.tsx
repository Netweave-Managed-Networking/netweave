import { OrganizationCategory } from '@/types/organization-category.model';
import { OrganizationCategoryDeleteButton } from './organization-category-delete-button';
import { OrganizationCategoryUpdateButton } from './organization-category-update-button';

export interface OrganizationCategoryEditProps {
  organizationCategory: OrganizationCategory;
}

export default function OrganizationCategoryEdit({ organizationCategory }: OrganizationCategoryEditProps) {
  return (
    <div key={organizationCategory.id} className="m-3 flex justify-between bg-white shadow-sm sm:rounded-lg">
      <div className="px-6 py-6">
        <h3 className="text-lg">{organizationCategory.name}</h3>
        <p>{organizationCategory.description}</p>
      </div>
      <div className="grid" style={{ borderLeft: '1px solid #e5e5e5' }}>
        <OrganizationCategoryUpdateButton category={organizationCategory} style={{ borderBottom: '1px solid #e5e5e5' }} />
        <OrganizationCategoryDeleteButton category={organizationCategory} />
      </div>
    </div>
  );
}
