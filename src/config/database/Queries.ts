import { FiltersPessoaDTO } from '../../dto/pessoa/filterPessoa.dto';
import { Prisma } from '@prisma/client';

export function generateQueryByFiltersForPessoa(
      filters: FiltersPessoaDTO,
): Prisma.TitularWhereInput {
      const orFilters: Prisma.TitularWhereInput[] = [];

      if (filters.nome) {
            orFilters.push(
                  { nome: { contains: filters.nome, mode: 'insensitive' } },
                  { Dependente: { some: { nome: { contains: filters.nome, mode: 'insensitive' } } } }
            );
      }
      if (filters.cpf) {
            orFilters.push(
                  { cpf: { contains: filters.cpf, mode: 'insensitive' } },
                  { Dependente: { some: { cpf: { contains: filters.cpf, mode: 'insensitive' } } } }
            );
      }
      if (filters.rg) {
            orFilters.push(
                  { rg: { contains: filters.rg, mode: 'insensitive' } },
                  { Dependente: { some: { rg: { contains: filters.rg, mode: 'insensitive' } } } }
            );
      }
      if (filters.whatsapp) {
            orFilters.push(
                  { whatsapp: { contains: filters.whatsapp, mode: 'insensitive' } },
                  { Dependente: { some: { whatsapp: { contains: filters.whatsapp, mode: 'insensitive' } } } }
            );
      }

      const query: Prisma.TitularWhereInput = {};
      if (orFilters.length > 0) {
            query.OR = orFilters;
      }

      if (filters.initialDate || filters.finalDate) {
            query.dataNascimento = {};
            if (filters.initialDate) {
                  query.dataNascimento.gte = new Date(filters.initialDate);
            }
            if (filters.finalDate) {
                  query.dataNascimento.lte = new Date(filters.finalDate);
            }
      }

      return query;
}
