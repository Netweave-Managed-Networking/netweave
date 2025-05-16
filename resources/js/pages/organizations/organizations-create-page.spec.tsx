import { mockOrganizationCategories } from '@/testing/mock-organization-categories.mock';
import { mockUser } from '@/testing/mock-users.mock';
import { render, screen } from '@testing-library/react';
import OrganizationsCreatePage from './organizations-create-page';

jest.mock('@inertiajs/react', () => ({
  ...jest.requireActual('@inertiajs/react'),
  Head: ({ title }: { title: string }) => <title>{title}</title>,
}));

jest.mock('@/layouts/authenticated-layout', () => ({ children }: { children: React.ReactNode }) => <div>{children}</div>);

jest.mock('@/components/organizations/organization-create', () => ({
  OrganizationCreate: () => <div>OrganizationCreate</div>,
}));

describe('OrganizationsCreatePage', () => {
  it('should render the OrganizationCreate compo', () => {
    render(<OrganizationsCreatePage auth={{ user: mockUser }} organizationCategories={mockOrganizationCategories} />);

    expect(screen.getByText('OrganizationCreate')).toBeInTheDocument();
  });
});
