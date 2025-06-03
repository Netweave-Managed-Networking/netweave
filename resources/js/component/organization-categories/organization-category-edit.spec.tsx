import { mockOrganizationCategories } from '@/testing/mock-organization-categories.mock';
import { render, screen } from '@testing-library/react';
import OrganizationCategoryEdit from './organization-category-edit';

// Mock the OrganizationCategoryDeleteButton component
jest.mock('./organization-category-delete-button', () => ({
  OrganizationCategoryDeleteButton: jest.fn(() => <div>Mock Delete Button</div>),
}));

describe('OrganizationCategoryEdit', () => {
  it('renders organization category details and delete button', () => {
    const mockCategory = {
      ...mockOrganizationCategories[0],
      id: 1,
      name: 'Category Name',
      description: 'Category Description',
    };

    render(<OrganizationCategoryEdit organizationCategory={mockCategory} />);

    // Check if the name and description are rendered
    expect(screen.getByText('Category Name')).toBeInTheDocument();
    expect(screen.getByText('Category Description')).toBeInTheDocument();

    // Check if the delete button is rendered
    expect(screen.getByText('Mock Delete Button')).toBeInTheDocument();
  });
});
