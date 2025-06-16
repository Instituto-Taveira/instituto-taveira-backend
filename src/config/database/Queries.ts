import { FiltersPessoaDTO } from '../../dto/pessoa/filterPessoa.dto';

export function generateQueryByFiltersForPessoa(
      filters: FiltersPessoaDTO,
): any {
      const fields = {
            nome: () => ({
                  nome: { contains: filters.nome, mode: 'insensitive' },
            }),
            cpf: () => ({
                  cpf: { contains: filters.cpf, mode: 'insensitive' },
            }),
            rg: () => ({
                  rg: { contains: filters.rg, mode: 'insensitive' },
            }),
            dataNascimento: () => ({
                  dataNascimento: new Date(filters.dataNascimento),
            }),
            cidade: () => ({
                  cidade: { contains: filters.cidade, mode: 'insensitive' },
            }),
            bairro: () => ({
                  bairro: { contains: filters.bairro, mode: 'insensitive' },
            }),
            estado: () => ({
                  estado: { contains: filters.estado, mode: 'insensitive' },
            }),
            whatsapp: () => ({
                  whatsapp: { contains: filters.whatsapp, mode: 'insensitive' },
            }),
      };

      const keysFields = Object.keys(fields);
      let query: any;
      // eslint-disable-next-line @typescript-eslint/ban-types
      let queryBuilder: Function;

      for (const filter in filters) {
            if (filters[filter] && keysFields.includes(filter)) {
                  queryBuilder = fields[filter];

                  const newCondition = queryBuilder();

                  if (query) {
                        Object.assign(query, { ...newCondition });
                  } else {
                        query = newCondition;
                  }
            }
      }

      return query;
}
