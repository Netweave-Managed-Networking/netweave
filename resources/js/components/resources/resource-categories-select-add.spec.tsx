import ResourceCategoriesSelectAdd, { ResourceCategoriesSelectAddProps } from '@/components/resources/resource-categories-select-add';
import { IdTitle } from '@/types/id-title.model';
import { fireEvent, render } from '@testing-library/react';

describe('ResourceCategoriesSelect', () => {
  const resourceCategories: IdTitle[] = [
    { id: 1, title: 'Category 1' },
    { id: 2, title: 'Category 2' },
  ];

  const onChange = jest.fn();

  const renderComponent = (props: Partial<ResourceCategoriesSelectAddProps> = {}) => {
    return render(
      <ResourceCategoriesSelectAdd resourceCategories={resourceCategories} resourceCategoriesSelected={[]} onChange={onChange} {...props} />,
    );
  };

  it('renders without crashing', () => {
    const { getByText } = renderComponent();
    expect(getByText('Category 1')).toBeInTheDocument();
    expect(getByText('Category 2')).toBeInTheDocument();
  });

  it('calls onChange when a category is selected', () => {
    const { getByText } = renderComponent();
    fireEvent.click(getByText('Category 1'));
    expect(onChange).toHaveBeenCalledWith([1]);
  });

  it('applies the provided className', () => {
    const { container } = renderComponent({ className: 'custom-class' });
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
