import axios from 'axios';
import { fetchOrganizations } from './fetchOrganizations.axios';

jest.mock('axios');

// Mock the `route` function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).route = jest.fn().mockImplementation((name: string) => {
  if (name === 'organizations.api.index') {
    return '/organizations/api'; // Replace with the actual API endpoint
  }
});

describe('fetchOrganizations', () => {
  it('should fetch organizations successfully', async () => {
    const mockData = [
      { id: 1, name: 'Organization 1' },
      { id: 2, name: 'Organization 2' },
    ];
    (axios.get as jest.Mock).mockResolvedValue({ data: mockData });

    const result = await fetchOrganizations();

    expect(route).toHaveBeenCalledWith('organizations.api.index');
    expect(axios.get).toHaveBeenCalledWith('/organizations/api');
    expect(result).toEqual(mockData);
  });

  it('should handle errors when fetching organizations', async () => {
    const mockError = new Error('Network Error');
    (axios.get as jest.Mock).mockRejectedValue(mockError);

    await expect(fetchOrganizations()).rejects.toThrow('Network Error');
    expect(route).toHaveBeenCalledWith('organizations.api.index');
    expect(axios.get).toHaveBeenCalledWith('/organizations/api');
  });
});
