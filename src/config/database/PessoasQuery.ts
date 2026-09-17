import { Prisma } from '@prisma/client';
import { FiltersPessoaDTO } from '../../dto/pessoa/filterPessoa.dto';

/**
 * A listagem de pessoas mistura titulares e dependentes na mesma tabela da
 * tela. Quando ha filtro, contar e paginar por titular da numeros errados
 * (a tela de Modalidades conta pessoas), entao montamos uma uniao das duas
 * origens e paginamos sobre ela.
 */

export function temFiltroDePessoa(f: Partial<FiltersPessoaDTO>): boolean {
      return Boolean(
            f.nome || f.cpf || f.rg || f.whatsapp || f.modalidade || f.vinculo ||
            f.initialDate || f.finalDate,
      );
}

/** Condicoes aplicadas igualmente a titulares e a dependentes. */
function condicoesComuns(
      f: Partial<FiltersPessoaDTO>,
      alias: string,
): Prisma.Sql[] {
      const c: Prisma.Sql[] = [];
      const col = (nome: string) => Prisma.raw(`"${alias}"."${nome}"`);

      if (f.nome) c.push(Prisma.sql`${col('nome')} ILIKE ${'%' + f.nome + '%'}`);
      if (f.cpf) c.push(Prisma.sql`${col('cpf')} ILIKE ${'%' + f.cpf + '%'}`);
      if (f.rg) c.push(Prisma.sql`${col('rg')} ILIKE ${'%' + f.rg + '%'}`);
      if (f.whatsapp) c.push(Prisma.sql`${col('whatsapp')} ILIKE ${'%' + f.whatsapp + '%'}`);
      if (f.initialDate) c.push(Prisma.sql`${col('dataNascimento')} >= ${new Date(f.initialDate)}`);
      if (f.finalDate) c.push(Prisma.sql`${col('dataNascimento')} <= ${new Date(f.finalDate)}`);

      return c;
}

function onde(cs: Prisma.Sql[]): Prisma.Sql {
      return cs.length ? Prisma.sql`WHERE ${Prisma.join(cs, ' AND ')}` : Prisma.empty;
}

/** SELECT de um dos lados da uniao (titulares ou dependentes). */
function lado(f: Partial<FiltersPessoaDTO>, tipo: 'titular' | 'dependente'): Prisma.Sql {
      const eTitular = tipo === 'titular';
      const tabela = Prisma.raw(eTitular ? '"titulares" t' : '"dependentes" d');
      const alias = eTitular ? 't' : 'd';
      const idTitular = Prisma.raw(eTitular ? '"t"."id"' : '"d"."titularId"');
      const colunaVinculo = Prisma.raw(eTitular ? '"v"."titularId"' : '"v"."dependenteId"');

      const cs = condicoesComuns(f, alias);

      if (f.modalidade) {
            cs.push(Prisma.sql`EXISTS (
                  SELECT 1 FROM "vinculo_modalidades" v
                    JOIN "modalidades" m ON m."id" = v."modalidadeId"
                   WHERE ${colunaVinculo} = ${Prisma.raw(`"${alias}"."id"`)}
                     AND lower(m."nome") = lower(${f.modalidade.trim()})
            )`);
      }

      return Prisma.sql`
            SELECT ${tipo} AS tipo,
                   ${Prisma.raw(`"${alias}"."id"`)} AS id,
                   ${idTitular} AS titular_id,
                   ${Prisma.raw(`"${alias}"."nome"`)} AS nome
              FROM ${tabela}
              ${onde(cs)}
      `;
}

/** Uniao das duas origens, respeitando o filtro de vinculo. */
export function unicaoDePessoas(f: Partial<FiltersPessoaDTO>): Prisma.Sql {
      const vinculo = f.vinculo?.trim().toLowerCase();
      const partes: Prisma.Sql[] = [];

      if (vinculo !== 'dependente') partes.push(lado(f, 'titular'));
      if (vinculo !== 'titular') partes.push(lado(f, 'dependente'));

      return Prisma.sql`SELECT * FROM (${Prisma.join(partes, ' UNION ALL ')}) pessoas`;
}
