import { OrganizationMin } from '@/types/organization-min.model';
import { User } from '@/types/user.model';
import { render } from '@testing-library/react';
import ResourceCreatePage from './ResourceCreatePage';

jest.mock('@inertiajs/react', () => ({
  ...jest.requireActual('@inertiajs/react'),
  Head: ({ title }: { title: string }) => <title>{title}</title>,
}));

jest.mock('@/Layouts/AuthenticatedLayout', () => ({ children }: { children: React.ReactNode }) => <div>{children}</div>);

describe('ResourceCreatePage', () => {
  const mockProps = {
    auth: { user: { name: 'Test User' } as User },
    organization: { name: 'Test Organization' } as OrganizationMin,
    resourceCategories: [{ id: 1, title: 'Category 1' }],
  };

  it('renders the ResourceCreate component with correct props', () => {
    const { getByText } = render(<ResourceCreatePage {...mockProps} />);
    expect(getByText('Category 1')).toBeInTheDocument();
  });

  it('handles missing resourceCategories gracefully', () => {
    const { queryByText } = render(<ResourceCreatePage {...mockProps} resourceCategories={[]} />);
    expect(queryByText('Category 1')).not.toBeInTheDocument();
  });
});
