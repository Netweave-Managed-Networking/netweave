import { ResourceCategoryCreate } from '@/types/resource-category-create.model';
import axios from 'axios';
import { storeResourceCategory, StoreResourceCategoryError } from './store-resource-category.axios';

jest.mock('axios');

// Mock the `route` function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).route = jest.fn().mockImplementation((name: string) => {
  if (name === 'resource-categories.api.store') {
    return '/resource-categories/api';
  }
});

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('storeResourceCategory', () => {
  const mockCategory: ResourceCategoryCreate = {
    title: 'New Category',
    definition: 'Description for new category',
  };

  it('should return a ResourceCategory when the request succeeds', async () => {
    const mockResponse = {
      id: 1,
      title: mockCategory.title,
      definition: mockCategory.definition,
    };
    mockedAxios.post.mockResolvedValue({ data: mockResponse });

    const result = await storeResourceCategory(mockCategory);

    expect(result).toEqual(mockResponse);
    expect(mockedAxios.post).toHaveBeenCalledWith(route('resource-categories.api.store'), mockCategory);
  });

  it('should throw an error when the request fails', async () => {
    const mockError = new Error('Request failed with status code 500') as StoreResourceCategoryError;
    mockedAxios.post.mockRejectedValue(mockError);

    await expect(storeResourceCategory(mockCategory)).rejects.toThrow('Request failed with status code 500');
    expect(mockedAxios.post).toHaveBeenCalledWith(route('resource-categories.api.store'), mockCategory);
  });
});
