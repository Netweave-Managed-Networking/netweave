import axios from 'axios';
import { fetchOrganizationCategory } from './fetch-organization-category.axios';

jest.mock('axios');

// Mock the `route` function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).route = jest
  .fn()
  .mockImplementation((name: string, id: number) => {
    if (name === 'organization-categories.api.get') {
      return `/organization-categories/api/${id}`;
    }
  });

describe('fetchOrganizationCategory', () => {
  it('should fetch the organization category successfully', async () => {
    const mockCategoryId = 1;
    const mockData = {
      id: mockCategoryId,
      name: 'Category 1',
      organizations: [
        { id: 1, name: 'Organization A' },
        { id: 2, name: 'Organization B' },
      ],
    };
    (axios.get as jest.Mock).mockResolvedValue({ data: mockData });

    const result = await fetchOrganizationCategory(mockCategoryId);

    expect(route).toHaveBeenCalledWith(
      'organization-categories.api.get',
      mockCategoryId
    );
    expect(axios.get).toHaveBeenCalledWith(
      `/organization-categories/api/${mockCategoryId}`
    );
    expect(result).toEqual(mockData);
  });

  it('should handle errors when fetching the organization category', async () => {
    const mockCategoryId = 1;
    const mockError = new Error('Network Error');
    (axios.get as jest.Mock).mockRejectedValue(mockError);

    await expect(fetchOrganizationCategory(mockCategoryId)).rejects.toThrow(
      'Network Error'
    );
    expect(route).toHaveBeenCalledWith(
      'organization-categories.api.get',
      mockCategoryId
    );
    expect(axios.get).toHaveBeenCalledWith(
      `/organization-categories/api/${mockCategoryId}`
    );
  });
});
