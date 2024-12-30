import { render, screen } from '@testing-library/react';
import OrganizationCategoryEdit from './OrganizationCategoryEdit';

// Mock the OrganizationCategoryDeleteButton component
jest.mock('./OrganizationCategoryDeleteButton', () => ({
  OrganizationCategoryDeleteButton: jest.fn(() => (
    <div>Mock Delete Button</div>
  )),
}));

describe('OrganizationCategoryEdit', () => {
  it('renders organization category details and delete button', () => {
    const mockCategory = {
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
