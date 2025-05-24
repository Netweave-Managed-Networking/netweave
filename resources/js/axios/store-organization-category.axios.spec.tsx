import { OrganizationCategoryCreate } from '@/types/organization-category-create.model';
import axios from 'axios';
import {
  storeOrganizationCategory,
  StoreOrganizationCategoryError,
} from './store-organization-category.axios';

jest.mock('axios');

// Mock the `route` function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).route = jest.fn().mockImplementation((name: string) => {
  if (name === 'organization-categories.api.store') {
    return '/organization-categories/api';
  }
});

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('storeOrganizationCategory', () => {
  const mockCategory: OrganizationCategoryCreate = {
    name: 'New Category',
    description: 'Description for new category',
  };

  it('should return a OrganizationCategory when the request succeeds', async () => {
    const mockResponse = {
      id: 1,
      name: mockCategory.name,
      description: mockCategory.description,
    };
    mockedAxios.post.mockResolvedValue({ data: mockResponse });

    const result = await storeOrganizationCategory(mockCategory);

    expect(result).toEqual(mockResponse);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      route('organization-categories.api.store'),
      mockCategory
    );
  });

  it('should throw an error when the request fails', async () => {
    const mockError = new Error(
      'Request failed with status code 500'
    ) as StoreOrganizationCategoryError;
    mockedAxios.post.mockRejectedValue(mockError);

    await expect(storeOrganizationCategory(mockCategory)).rejects.toThrow(
      'Request failed with status code 500'
    );
    expect(mockedAxios.post).toHaveBeenCalledWith(
      route('organization-categories.api.store'),
      mockCategory
    );
  });
});
