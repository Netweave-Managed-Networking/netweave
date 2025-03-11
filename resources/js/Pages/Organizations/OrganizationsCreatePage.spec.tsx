/* eslint-disable react/display-name */
import { mockOrganizationCategories } from '@/testing/mock-organization-categories.mock';
import { mockUser } from '@/testing/mock-users.mock';
import { render, screen } from '@testing-library/react';
import OrganizationsCreatePage from './OrganizationsCreatePage';

jest.mock('@inertiajs/react', () => ({
  ...jest.requireActual('@inertiajs/react'),
  Head: ({ title }: { title: string }) => <title>{title}</title>,
}));

jest.mock(
  '@/Layouts/AuthenticatedLayout',
  () =>
    ({ children }: { children: React.ReactNode }) => <div>{children}</div>
);

jest.mock('@/Components/Organizations/OrganizationCreate', () => ({
  OrganizationCreate: () => <div>OrganizationCreate</div>,
}));

describe('OrganizationsCreatePage', () => {
  it('should render the OrganizationCreate compo', () => {
    render(
      <OrganizationsCreatePage
        auth={{ user: mockUser }}
        organizationCategories={mockOrganizationCategories}
      />
    );

    expect(screen.getByText('OrganizationCreate')).toBeInTheDocument();
  });
});
