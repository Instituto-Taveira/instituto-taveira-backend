import { convertAndVerifyNumber } from '../../utils/Utils';
import { IQueryClient } from '../../dto/client/queryClient';
import { FiltersClientDTO } from 'src/dto/client/filterClient.dto';
import { GenerateReportLoanDto } from 'src/dto/loan/generate-report-loan.dto';

export function generateQueryByFiltersForClient(
      filters: FiltersClientDTO,
): IQueryClient {
      const fields = {
            name: () => ({
                  name: { contains: filters.name, mode: 'insensitive' },
            }),
            attendant: () => ({
                  attendantUser: {
                        name: {
                              contains: filters.attendant,
                              mode: 'insensitive',
                        },
                  },
            }),
            initialDate: () => ({
                  loan: {
                        some: {
                              payment: {
                                    some: {
                                          settled: false,
                                          dueDate: {
                                                gte: new Date(
                                                      filters.initialDate,
                                                ).toISOString(),
                                                lte: new Date(
                                                      filters.finalDate,
                                                ).toISOString(),
                                          },
                                    },
                              },
                        },
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
      // console.log(query.loan.every.payment.every);
      return query;
}

export function generateQueryByFiltersForReport(
      filters: GenerateReportLoanDto,
): IQueryClient {
      const fields = {
            attendant: () => ({
                  attendantUser: {
                        name: {
                              contains: filters.attendant,
                              mode: 'insensitive',
                        },
                  },
            }),
            initialDate: () => ({
                  loan: {
                        some: {
                              payment: {
                                    some: {
                                          settled: false,
                                          dueDate: {
                                                gte: new Date(
                                                      filters.initialDate,
                                                ).toISOString(),
                                                lte: new Date(
                                                      filters.finalDate,
                                                ).toISOString(),
                                          },
                                    },
                              },
                        },
                  },
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
