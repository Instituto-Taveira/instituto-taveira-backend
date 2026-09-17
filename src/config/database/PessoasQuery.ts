import { Prisma } from '@prisma/client';
import { FiltersPessoaDTO } from '../../dto/pessoa/filterPessoa.dto';

/**
 * A listagem de pessoas mistura titulares e dependentes na mesma tabela da
 * tela. Quando ha filtro, contar e paginar por titular da numeros errados
 * (a tela de Modalidades conta pessoas), entao montamos uma uniao das duas
 * origens e paginamos sobre ela.
 */

/** Um mesmo campo pode vir repetido: cada valor vira mais uma condicao. */
type Valor = string | string[] | undefined;

function valores(v: Valor): string[] {
      if (Array.isArray(v)) return v.filter(x => x != null && x !== '');
      return v != null && v !== '' ? [v] : [];
}

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

      // Cada filtro adiciona uma condicao; todas valem juntas (AND), entao
      // filtrar uma coluna e depois outra vai estreitando o resultado.
      const contem = (campo: string, v: Valor) => {
            for (const valor of valores(v)) {
                  c.push(Prisma.sql`${col(campo)} ILIKE ${'%' + valor + '%'}`);
            }
      };

      contem('nome', f.nome as Valor);
      contem('cpf', f.cpf as Valor);
      contem('rg', f.rg as Valor);
      contem('whatsapp', f.whatsapp as Valor);

      for (const v of valores(f.initialDate as Valor)) {
            c.push(Prisma.sql`${col('dataNascimento')} >= ${new Date(v)}`);
      }
      for (const v of valores(f.finalDate as Valor)) {
            c.push(Prisma.sql`${col('dataNascimento')} <= ${new Date(v)}`);
      }

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

      // Varias modalidades: a pessoa precisa praticar todas (AND).
      for (const modalidade of valores(f.modalidade as Valor)) {
            cs.push(Prisma.sql`EXISTS (
                  SELECT 1 FROM "vinculo_modalidades" v
                    JOIN "modalidades" m ON m."id" = v."modalidadeId"
                   WHERE ${colunaVinculo} = ${Prisma.raw(`"${alias}"."id"`)}
                     AND lower(m."nome") = lower(${modalidade.trim()})
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
      const vinculo = valores(f.vinculo as Valor)[0]?.trim().toLowerCase();
      const partes: Prisma.Sql[] = [];

      if (vinculo !== 'dependente') partes.push(lado(f, 'titular'));
      if (vinculo !== 'titular') partes.push(lado(f, 'dependente'));

      return Prisma.sql`SELECT * FROM (${Prisma.join(partes, ' UNION ALL ')}) pessoas`;
}
