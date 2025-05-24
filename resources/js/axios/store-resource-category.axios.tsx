import { ResourceCategoryCreate } from '@/types/resource-category-create.model';
import { ResourceCategory } from '@/types/resource-category.model';
import axios, { AxiosError } from 'axios';

export type StoreResourceCategoryErrors = Partial<ResourceCategoryCreate>;

export type StoreResourceCategoryError = AxiosError<{
  message: string;
  errors: StoreResourceCategoryErrors;
}>;

/** throws error when http request is 4xx or 5xx */
export const storeResourceCategory = async (
  category: ResourceCategoryCreate
): Promise<ResourceCategory> | never =>
  (await axios.post(route('resource-categories.api.store'), category)).data;
