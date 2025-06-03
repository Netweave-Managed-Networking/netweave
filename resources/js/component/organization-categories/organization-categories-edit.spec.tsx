import { ToastProvider } from '@/providers/toast-provider';
import { mockOrganizationCategories } from '@/testing/mock-organization-categories.mock';
import { fireEvent, render, screen } from '@testing-library/react';
import { OrganizationCategoriesEdit } from './organization-categories-edit';

// Mock the OrganizationCategoryEdit component
jest.mock('@/component/organization-categories/organization-category-edit', () => () => <div>OrganizationCategoryEdit</div>);

// Mock the OrganizationCategoryAdd component
jest.mock(
  '@/component/organization-categories/organization-category-add',
  () =>
    ({ onOrganizationCategoryAdd }: { onOrganizationCategoryAdd: (newCategory: unknown) => void }) => (
      <button onClick={() => onOrganizationCategoryAdd({ id: 200, name: 'New Category' })}>Add Category</button>
    ),
);

describe('OrganizationCategoriesEdit', () => {
  it('renders the page with organization categories', () => {
    render(
      <ToastProvider>
        <OrganizationCategoriesEdit organizationCategories={mockOrganizationCategories} />
      </ToastProvider>,
    );

    // Verify that the organization categories are rendered
    const organizationCategoryElements = screen.getAllByText('OrganizationCategoryEdit');
    expect(organizationCategoryElements.length).toBe(mockOrganizationCategories.length);
  });

  it('shows a toast message when a new category is added', async () => {
    render(
      <ToastProvider>
        <OrganizationCategoriesEdit organizationCategories={mockOrganizationCategories} />
      </ToastProvider>,
    );

    // Simulate adding a new category
    fireEvent.click(screen.getByText('Add Category'));

    // Verify the toast message is shown
    expect(await screen.findByText("Organisationskategorie 'New Category' erstellt.")).toBeInTheDocument();
  });
});
