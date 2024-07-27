import { Page, PageResponse } from './page.model';

export abstract class Pageable<T> {
      buildPage(page: Page): Page {
            return {
                  skip: page.skip ? Number(page.skip) : 0,
                  take: page.take ? Number(page.take) : 1000,
            };
      }

      buildPageResponse(items: T[], total: number): PageResponse<T> {
            return {
                  items,
                  total,
            };
      }
}
