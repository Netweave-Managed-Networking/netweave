import { OrganizationCategoryCreate } from '@/types/organization-category-create.model';
import { OrganizationCategory } from '@/types/organization-category.model';
import axios, { AxiosError } from 'axios';

export type StoreOrganizationCategoryErrors = {
  name?: string;
  description?: string;
};

export type StoreOrganizationCategoryError = AxiosError<{
  message: string;
  errors: StoreOrganizationCategoryErrors;
}>;

/** throws error when http request is 4xx or 5xx */
export const storeOrganizationCategory = async (
  category: OrganizationCategoryCreate
): Promise<OrganizationCategory> | never =>
  (await axios.post(route('organization-categories.api.store'), category)).data;
