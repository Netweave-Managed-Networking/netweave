import axios from 'axios';
import { fetchStakeholderOrganizations } from './fetchStakeholderOrganizations.axios';

jest.mock('axios');

// Mock the `route` function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).route = jest.fn().mockImplementation((name: string) => {
  if (name === 'stakeholder-organizations.api.index') {
    return '/stakeholder-organizations/api'; // Replace with the actual API endpoint
  }
});

describe('fetchStakeholderOrganizations', () => {
  it('should fetch stakeholder organizations successfully', async () => {
    const mockData = [
      { id: 1, name: 'Organization 1' },
      { id: 2, name: 'Organization 2' },
    ];
    (axios.get as jest.Mock).mockResolvedValue({ data: mockData });

    const result = await fetchStakeholderOrganizations();

    expect(route).toHaveBeenCalledWith('stakeholder-organizations.api.index');
    expect(axios.get).toHaveBeenCalledWith('/stakeholder-organizations/api');
    expect(result).toEqual(mockData);
  });

  it('should handle errors when fetching stakeholder organizations', async () => {
    const mockError = new Error('Network Error');
    (axios.get as jest.Mock).mockRejectedValue(mockError);

    await expect(fetchStakeholderOrganizations()).rejects.toThrow(
      'Network Error'
    );
    expect(route).toHaveBeenCalledWith('stakeholder-organizations.api.index');
    expect(axios.get).toHaveBeenCalledWith('/stakeholder-organizations/api');
  });
});
