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

/** Expressao que produz o valor exibido de uma coluna, para listar opcoes. */
function expressaoDoCampo(campo: CampoFiltravel, alias: string, tipo: string): Prisma.Sql {
      const col = (n: string) => Prisma.raw(`"${alias}"."${n}"`);
      switch (campo) {
            case 'nome':
                  return Prisma.sql`${col('nome')}`;
            case 'whatsapp':
                  return Prisma.sql`${col('whatsapp')}`;
            case 'vinculo':
                  return Prisma.sql`${Prisma.raw(`'${tipo === 'titular' ? 'Titular' : 'Dependente'}'`)}`;
            case 'idade':
                  // idade completa em anos, como a tela mostra
                  return Prisma.sql`(date_part('year', age(${col('dataNascimento')})))::int::text`;
            case 'modalidade':
                  return Prisma.sql`NULL`;
      }
}

/** SELECT de um dos lados da uniao (titulares ou dependentes). */
function lado(
      f: Partial<FiltersPessoaDTO>,
      tipo: 'titular' | 'dependente',
      campoValor?: CampoFiltravel,
): Prisma.Sql {
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

      const valor = campoValor
            ? Prisma.sql`, ${expressaoDoCampo(campoValor, alias, tipo)} AS valor`
            : Prisma.empty;

      return Prisma.sql`
            SELECT ${tipo} AS tipo,
                   ${Prisma.raw(`"${alias}"."id"`)} AS id,
                   ${idTitular} AS titular_id,
                   ${Prisma.raw(`"${alias}"."nome"`)} AS nome
                   ${valor}
              FROM ${tabela}
              ${onde(cs)}
      `;
}

/** Campos que a tela oferece como filtro de coluna. */
export const CAMPOS_FILTRAVEIS = [
      'nome',
      'vinculo',
      'modalidade',
      'whatsapp',
      'idade',
] as const;

export type CampoFiltravel = (typeof CAMPOS_FILTRAVEIS)[number];

/** Maximo de opcoes devolvidas para o filtro de uma coluna. */
export const LIMITE_DE_VALORES = 500;

/**
 * Valores que ainda existem numa coluna, considerando os filtros das OUTRAS
 * colunas (o proprio campo e ignorado, senao a lista so mostraria o que ja
 * esta selecionado).
 */
export function valoresDaColuna(
      campo: CampoFiltravel,
      f: Partial<FiltersPessoaDTO>,
): Prisma.Sql {
      const semEleMesmo: Partial<FiltersPessoaDTO> = { ...f };
      delete semEleMesmo[campo as keyof FiltersPessoaDTO];
      if (campo === 'idade') {
            delete semEleMesmo.initialDate;
            delete semEleMesmo.finalDate;
      }

      const base = unicaoDePessoas(semEleMesmo, campo);
      // Teto de seguranca: uma coluna como Nome pode ter milhares de valores
      // distintos, e a lista inteira travaria a tela.
      return Prisma.sql`
            SELECT DISTINCT valor FROM (${base}) p
             WHERE valor IS NOT NULL AND valor <> ''
             ORDER BY valor ASC
             LIMIT ${LIMITE_DE_VALORES}
      `;
}

/** Uniao das duas origens, respeitando o filtro de vinculo. */
export function unicaoDePessoas(
      f: Partial<FiltersPessoaDTO>,
      campoValor?: CampoFiltravel,
): Prisma.Sql {
      const vinculo = valores(f.vinculo as Valor)[0]?.trim().toLowerCase();
      const partes: Prisma.Sql[] = [];

      if (vinculo !== 'dependente') partes.push(lado(f, 'titular', campoValor));
      if (vinculo !== 'titular') partes.push(lado(f, 'dependente', campoValor));

      return Prisma.sql`SELECT * FROM (${Prisma.join(partes, ' UNION ALL ')}) pessoas`;
}
