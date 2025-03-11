/* eslint-disable react/display-name */
import { mockOrganizationCategories } from '@/testing/mock-organization-categories.mock';
import { mockUser } from '@/testing/mock-users.mock';
import { render, screen } from '@testing-library/react';
import OrganizationCategoriesEditPage from './OrganizationCategoriesEditPage';

jest.mock('@inertiajs/react', () => ({
  Head: ({ title }: { title: string }) => <title>{title}</title>,
}));

jest.mock(
  '@/Layouts/AuthenticatedLayout',
  () =>
    ({ children }: { children: React.ReactNode }) => <div>{children}</div>
);

jest.mock(
  '@/Components/OrganizationCategories/OrganizationCategoriesEdit',
  () => ({
    OrganizationCategoriesEdit: ({
      organizationCategories,
    }: {
      organizationCategories: any[];
    }) => {
      return organizationCategories.map((category: any) => (
        <div>One Category</div>
      ));
    },
  })
);

describe('OrganizationCategoriesEditPage', () => {
  it('renders the page with OrganizationCategoriesEdit component', () => {
    render(
      <OrganizationCategoriesEditPage
        auth={{ user: mockUser }}
        organizationCategories={mockOrganizationCategories}
      />
    );

    // Verify the title is rendered
    expect(document.title).toBe('Organisationskategorien verwalten');

    // Verify that the organization categories are rendered
    const organizationCategoryElements = screen.getAllByText('One Category');
    expect(organizationCategoryElements.length).toBe(
      mockOrganizationCategories.length
    );
  });
});
