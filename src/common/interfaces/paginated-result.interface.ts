/**
 * Interface for a standard paginated API response.
 * @template T The type of the data array contained in the response.
 */
export interface PaginatedResult<T> {
      data: T[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
}
