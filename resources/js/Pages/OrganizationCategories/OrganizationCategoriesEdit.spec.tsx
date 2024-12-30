/* eslint-disable react/display-name */
import { mockOrganizationCategories } from '@/testing/mock-organization-categories.mock';
import { mockUser } from '@/testing/mock-users.mock';
import { render, screen } from '@testing-library/react';
import OrganizationCategoriesEdit from './OrganizationCategoriesEdit';

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

describe('OrganizationCategoriesEdit', () => {
  it('renders the page with organization categories', () => {
    render(
      <OrganizationCategoriesEdit
        auth={{ user: mockUser }}
        organizationCategories={mockOrganizationCategories}
      />
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
});
