import { convertAndVerifyNumber } from '../../utils/Utils';
import { IQueryClient } from '../../dto/client/queryClient';
import { FiltersClientDTO } from 'src/dto/client/filterClient.dto';

export function generateQueryByFiltersForClient(
      filters: FiltersClientDTO,
): IQueryClient {
      const fields = {
            name: () => ({
                  name: { contains: filters.name, mode: 'insensitive' },
            }),
            attendant: () => ({
                  attendant: {
                        contains: filters.attendant,
                        mode: 'insensitive',
                  },
            }),
            fone: () => ({
                  fone: filters.fone,
            }),
            address: () => ({
                  address: filters.address,
            }),
            loan: () => ({
                  loan: filters.loan,
            }),
      };

      const keysFields = Object.keys(fields);

      let query: any;

      let queryBuilder: Function;

      for (const filter in filters) {
            if (keysFields.includes(filter)) {
                  queryBuilder = fields[filter];

                  if (query) {
                        const newCondition = queryBuilder();

                        Object.assign(query, { ...newCondition });
                  } else {
                        query = queryBuilder();
                  }
            }
      }

      return query;
}
