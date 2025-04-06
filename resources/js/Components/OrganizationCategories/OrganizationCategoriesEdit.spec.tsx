import { ToastProvider } from '@/Providers/ToastProvider';
import { mockOrganizationCategories } from '@/testing/mock-organization-categories.mock';
import { fireEvent, render, screen } from '@testing-library/react';
import { OrganizationCategoriesEdit } from './OrganizationCategoriesEdit';

// Mock the OrganizationCategoryEdit component
jest.mock(
  '@/Components/OrganizationCategories/OrganizationCategoryEdit',
  () => () => <div>OrganizationCategoryEdit</div>
);

// Mock the OrganizationCategoryAdd component
jest.mock(
  '@/Components/OrganizationCategories/OrganizationCategoryAdd',
  () =>
    ({
      onOrganizationCategoryAdd,
    }: {
      onOrganizationCategoryAdd: (newCategory: any) => void;
    }) => (
      <button
        onClick={() =>
          onOrganizationCategoryAdd({ id: 1, name: 'New Category' })
        }
      >
        Add Category
      </button>
    )
);

describe('OrganizationCategoriesEdit', () => {
  it('renders the page with organization categories', () => {
    render(
      <ToastProvider>
        <OrganizationCategoriesEdit
          organizationCategories={mockOrganizationCategories}
        />
      </ToastProvider>
    );

    // Verify that the organization categories are rendered
    const organizationCategoryElements = screen.getAllByText(
      'OrganizationCategoryEdit'
    );
    expect(organizationCategoryElements.length).toBe(
      mockOrganizationCategories.length
    );
  });

  it('shows a toast message when a new category is added', async () => {
    render(
      <ToastProvider>
        <OrganizationCategoriesEdit
          organizationCategories={mockOrganizationCategories}
        />
      </ToastProvider>
    );

    // Simulate adding a new category
    fireEvent.click(screen.getByText('Add Category'));

    // Verify the toast message is shown
    expect(
      await screen.findByText("Organisationskategorie 'New Category' erstellt.")
    ).toBeInTheDocument();
  });
});
