import OrganizationCategoryAdd from '@/component/organization-categories/organization-category-add';
import OrganizationCategoryEdit from '@/component/organization-categories/organization-category-edit';
import { useToast } from '@/providers/toast-provider';
import { OrganizationCategory } from '@/types/organization-category.model';
import { useEffect, useState } from 'react';

export function OrganizationCategoriesEdit({
  organizationCategories,
}: {
  organizationCategories: OrganizationCategory[];
}) {
  const { showToast: setToast } = useToast();
  const [categories, setCategories] = useState([...organizationCategories]);

  useEffect(
    // this is kind of a hack to set the categories state value to the organizationCategories PageProp value (after an "update" or "delete" operation)
    // this needs to be done because the state value is only updated in case of an "add" (api returns json in that case)
    // the state value will not be updated by the frontend in case of an update or delete (because here a redirect with new page props happens)
    // in case of an update or delete the backend will redirect to the same page with the updated organizationCategories page prop value
    // which is why we need to update the state value every time the organizationCategories prop value might have changed
    () => setCategories([...organizationCategories]),
    [organizationCategories]
  );

  const addCategorySorted = (newCategory: OrganizationCategory) => {
    setCategories(
      [...categories, newCategory].sort((a, b) => a.name.localeCompare(b.name))
    );
  };

  const showToastCategoryCreated = (newCategory: OrganizationCategory) => {
    setToast(
      `Organisationskategorie '${newCategory.name}' erstellt.`,
      'success'
    );
  };

  return (
    <>
      <OrganizationCategoryAdd
        onOrganizationCategoryAdd={newCategory => {
          if (newCategory) {
            addCategorySorted(newCategory);
            showToastCategoryCreated(newCategory);
          }
        }}
      />
      {categories.map(category => (
        <OrganizationCategoryEdit
          key={category.id}
          organizationCategory={category}
        />
      ))}
    </>
  );
}
