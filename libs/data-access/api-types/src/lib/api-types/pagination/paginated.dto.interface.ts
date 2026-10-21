/** one page of a larger list, along with enough info to page through the rest */
export interface PaginatedDTO<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}
