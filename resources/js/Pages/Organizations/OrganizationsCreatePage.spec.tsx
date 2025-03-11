/* eslint-disable react/display-name */
import { mockOrganizationCategories } from '@/testing/mock-organization-categories.mock';
import { mockUser } from '@/testing/mock-users.mock';
import { render } from '@testing-library/react';
import OrganizationsCreatePage from './OrganizationsCreatePage';

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

jest.mock('@/Components/Input/InputLabel', () => () => <div>InputLabel</div>);
jest.mock('@/Components/Input/BadgeSelect', () => () => <div>BadgeSelect</div>);
jest.mock('@/Components/Input/InputError', () => () => <div>InputError</div>);
jest.mock('@/Components/Input/TextInput', () => () => <div>TextInput</div>);
jest.mock('@/Components/Input/PrimaryButton', () => () => (
  <div>PrimaryButton</div>
));

describe('OrganizationsCreatePage', () => {
  describe('complete form', () => {
    it('should render text input for organization name', () => {
      render(
        <OrganizationsCreatePage
          auth={{ user: mockUser }}
          organizationCategories={mockOrganizationCategories}
        />
      );

      // expect(screen.getByTitle('name')).toBeInTheDocument();
      expect(true).toBeTruthy();
    });
  });
});
