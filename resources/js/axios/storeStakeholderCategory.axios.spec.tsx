import { StakeholderCategoryCreate } from '@/types/stakeholder-category-create.model';
import axios from 'axios';
import {
  storeStakeholderCategory,
  StoreStakeholderCategoryError,
} from './storeStakeholderCategory.axios';

jest.mock('axios');

// Mock the `route` function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).route = jest.fn().mockImplementation((name: string) => {
  if (name === 'stakeholder-categories.api') {
    return '/stakeholder-categories/api'; // Replace with the actual API endpoint
  }
});

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('storeStakeholderCategory', () => {
  const mockCategory: StakeholderCategoryCreate = {
    name: 'New Category',
    description: 'Description for new category',
  };

  it('should return a StakeholderCategory when the request succeeds', async () => {
    const mockResponse = {
      id: 1,
      name: mockCategory.name,
      description: mockCategory.description,
    };
    mockedAxios.post.mockResolvedValue({ data: mockResponse });

    const result = await storeStakeholderCategory(mockCategory);

    expect(result).toEqual(mockResponse);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      route('stakeholder-categories.api'),
      mockCategory
    );
  });

  it('should throw an error when the request fails', async () => {
    const mockError = new Error(
      'Request failed with status code 500'
    ) as StoreStakeholderCategoryError;
    mockedAxios.post.mockRejectedValue(mockError);

    await expect(storeStakeholderCategory(mockCategory)).rejects.toThrow(
      'Request failed with status code 500'
    );
    expect(mockedAxios.post).toHaveBeenCalledWith(
      route('stakeholder-categories.api'),
      mockCategory
    );
  });
});
