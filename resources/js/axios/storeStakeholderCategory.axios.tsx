import { StakeholderCategoryCreate } from '@/types/stakeholder-category-create.model';
import { StakeholderCategory } from '@/types/stakeholder-category.model';
import axios, { AxiosError } from 'axios';

export type StoreStakeholderCategoryErrors = {
  name?: string;
  description?: string;
};

export type StoreStakeholderCategoryError = AxiosError<{
  message: string;
  errors: StoreStakeholderCategoryErrors;
}>;

/** throws error when http request is 4xx or 5xx */
export const storeStakeholderCategory = async (
  category: StakeholderCategoryCreate
): Promise<StakeholderCategory> | never =>
  (await axios.post(route('stakeholder-categories.api'), category)).data;
