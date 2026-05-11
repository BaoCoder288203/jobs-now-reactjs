/** Khớp với BE `PagedResponse<T>` (page 1-based). */
export type PagedList<T> = {
  items: T[];
  totalCount: number;
  page: number;
  limit: number;
  hasNext: boolean;
};
