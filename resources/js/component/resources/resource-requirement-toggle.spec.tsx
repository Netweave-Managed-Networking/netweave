import ResourceRequirementToggle from '@/component/resources/resource-requirement-toggle';
import { fireEvent, render } from '@testing-library/react';

describe('ResourceRequirementToggle', () => {
  const onChange = jest.fn();

  const renderComponent = () => {
    return render(<ResourceRequirementToggle onChange={onChange} />);
  };

  it('renders without crashing', () => {
    const { getByText } = renderComponent();
    expect(getByText('Ressource')).toBeInTheDocument();
    expect(getByText('Bedarf')).toBeInTheDocument();
  });

  it('calls onChange with "resource" when "Ressource" is clicked', () => {
    const { getByText } = renderComponent();
    fireEvent.click(getByText('Ressource'));
    expect(onChange).toHaveBeenCalledWith('resource');
  });

  it('calls onChange with "requirement" when "Bedarf" is clicked', () => {
    const { getByText } = renderComponent();
    fireEvent.click(getByText('Bedarf'));
    expect(onChange).toHaveBeenCalledWith('requirement');
  });

  it('highlights the selected option', () => {
    const { getByText, rerender } = renderComponent();
    fireEvent.click(getByText('Ressource'));
    rerender(<ResourceRequirementToggle onChange={onChange} />);
    expect(getByText('Ressource')).toHaveStyle('color: #fff');
    expect(getByText('Bedarf')).toHaveStyle('color: #000');

    fireEvent.click(getByText('Bedarf'));
    rerender(<ResourceRequirementToggle onChange={onChange} />);
    expect(getByText('Ressource')).toHaveStyle('color: #000');
    expect(getByText('Bedarf')).toHaveStyle('color: #fff');
  });

  it('sets the initial value based on the "value" prop', () => {
    const { getByText } = render(
      <ResourceRequirementToggle value="resource" onChange={onChange} />
    );
    expect(getByText('Ressource')).toHaveStyle('color: #fff');
    expect(getByText('Bedarf')).toHaveStyle('color: #000');
  });

  it('updates the selected option when the "value" prop changes', () => {
    const { getByText, rerender } = render(
      <ResourceRequirementToggle value="resource" onChange={onChange} />
    );
    expect(getByText('Ressource')).toHaveStyle('color: #fff');
    expect(getByText('Bedarf')).toHaveStyle('color: #000');

    rerender(
      <ResourceRequirementToggle value="requirement" onChange={onChange} />
    );
    expect(getByText('Ressource')).toHaveStyle('color: #000');
    expect(getByText('Bedarf')).toHaveStyle('color: #fff');
  });
});
