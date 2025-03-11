/* eslint-disable react/display-name */
import { ToastProvider } from '@/Providers/ToastProvider';
import { mockOrganizationCategories } from '@/testing/mock-organization-categories.mock';
import { mockUser } from '@/testing/mock-users.mock';
import { fireEvent, render, screen } from '@testing-library/react';
import OrganizationCategoriesEditPage from './OrganizationCategoriesEditPage';

// Mock the Head component from Inertia.js
jest.mock('@inertiajs/react', () => ({
  ...jest.requireActual('@inertiajs/react'),
  Head: ({ title }: { title: string }) => <title>{title}</title>,
}));

// Mock the AuthenticatedLayout
jest.mock(
  '@/Layouts/AuthenticatedLayout',
  () =>
    ({ children }: { children: React.ReactNode }) => <div>{children}</div>
);

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

describe('OrganizationCategoriesEditPage', () => {
  it('renders the page with organization categories', () => {
    render(
      <ToastProvider>
        <OrganizationCategoriesEditPage
          auth={{ user: mockUser }}
          organizationCategories={mockOrganizationCategories}
        />
      </ToastProvider>
    );

    // Verify the title is rendered
    expect(document.title).toBe('Organisationskategorien verwalten');

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
        <OrganizationCategoriesEditPage
          auth={{ user: mockUser }}
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
