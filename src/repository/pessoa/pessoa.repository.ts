import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/prisma.service';
import { Titular } from 'src/entities/titular.entity';
import { CreatePessoaDTO } from 'src/dto/pessoa/createPessoa.dto';
import IPessoaRepository from './pessoa.repository.contract';
import { FiltersPessoaDTO } from 'src/dto/pessoa/filterPessoa.dto';
import { generateQueryByFiltersForPessoa } from 'src/config/database/Queries';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { TitularMapper } from 'src/mappers/pessoa.mapper';
import { CPF } from 'src/entities/cpf.entity';
import { UpdatePessoaDTO } from 'src/dto/pessoa/updatePessoa.dto';

@Injectable()
export class PessoaRepository implements IPessoaRepository {
      constructor(private readonly repository: PrismaService) { }

      async create(data: CreatePessoaDTO): Promise<Titular> {
            // 1) Gera o objeto Prisma (titular + dependentes) sem endereço
            const prismaData = TitularMapper.toPrismaCreate(data);
            delete (prismaData as any).endereco; // remove o campo plano do mapper

            if (prismaData.Dependente?.create) {
                  prismaData.Dependente.create = prismaData.Dependente.create.map(dep => {
                        const { endereco: _skip, ...rest } = dep;
                        return rest;
                  });
            }

            // 2) Cria titular + dependentes (sem endereço)
            const createdTitular = await this.repository.titular.create({
                  data: prismaData,
                  include: { Dependente: true },
            });

            // 3) Cria endereço do titular, agora sim usando create separado
            if (data.endereco) {
                  await this.repository.endereco.create({
                        data: {
                              ...data.endereco,
                              titular: { connect: { id: createdTitular.id } }
                        },
                  });
            }

            // 4) Vínculos de modalidade do titular (array de IDs)
            if (data.modalidade?.length) {
                  for (const modalidadeId of data.modalidade) {
                        await this.repository.vinculoModalidade.create({
                              data: {
                                    modalidade: { connect: { id: modalidadeId } },
                                    titular: { connect: { id: createdTitular.id } },
                              },
                        });
                  }
            }

            // 5) Endereços e vínculos de modalidade dos dependentes

            if (data.dependentes?.length) {
                  for (const depEntity of createdTitular.Dependente) {
                        const dtoDep = data.dependentes.find(d =>
                              d.cpf === depEntity.cpf &&
                              new Date(d.dataNascimento).getTime() === depEntity.dataNascimento.getTime()
                        );
                        if (!dtoDep) continue;

                        // a) endereço do dependente
                        if (dtoDep.endereco) {
                              await this.repository.endereco.create({
                                    data: {
                                          ...dtoDep.endereco,
                                          dependenteId: depEntity.id,
                                    },
                              });
                        }

                        // b) vínculo modalidade do dependente
                        if (dtoDep.modalidade?.length) {
                              for (const modalidadeId of dtoDep.modalidade) {
                                    await this.repository.vinculoModalidade.create({
                                          data: {
                                                modalidadeId: modalidadeId,
                                                dependenteId: depEntity.id,
                                          },
                                    });
                              }
                        }
                  }
            }

            return TitularMapper.toDomain(createdTitular);
      }

      async findBirthDays(): Promise<{ pessoas: any[]; dependentes: any[] }> {
            const now = new Date();
            const currentMonth = now.getMonth(); // 0 = janeiro, …, 11 = dezembro

            const [allPessoas, allDependentes] = await Promise.all([
                  this.repository.titular.findMany({
                        select: {
                              id: true,
                              nome: true,
                              dataNascimento: true,
                              whatsapp: true,
                              fotoBase64: true,
                        },
                  }),
                  this.repository.dependente.findMany({
                        select: {
                              id: true,
                              nome: true,
                              dataNascimento: true,
                              fotoBase64: true,
                              whatsapp: true,
                              titularId: true,
                        },
                  }),
            ]);

            const pessoas = allPessoas
                  .filter(p => p.dataNascimento.getMonth() === currentMonth)
                  .sort((a, b) =>
                        a.dataNascimento.getDate() - b.dataNascimento.getDate()
                  );

            const dependentes = allDependentes
                  .filter(d => d.dataNascimento.getMonth() === currentMonth)
                  .sort((a, b) =>
                        a.dataNascimento.getDate() - b.dataNascimento.getDate()
                  );

            return { pessoas, dependentes };
      }


      async findById(id: number): Promise<Titular | null> {

            const foundById = await this.repository.titular.findUnique({
                  where: { id },
                  select: {
                        id: true,
                        nome: true,
                        numeroContato: true,
                        whatsapp: true,
                        dataNascimento: true,
                        cpf: true,
                        rg: true,
                        createdAt: true,
                        updatedAt: true,
                        fotoBase64: true,
                        cartaoSUS: true,
                        tituloEleitor: true,
                        secao: true,
                        zona: true,
                        localVotacao: true,
                        VinculoModalidade: {
                              select: {
                                    modalidade: {
                                          select: {
                                                nome: true,
                                          }
                                    }
                              }
                        },
                        endereco: {
                              select: {
                                    id: true,
                                    cep: true,
                                    bairro: true,
                                    cidade: true,
                                    estado: true,
                                    rua: true,
                                    numero: true,
                                    complemento: true,
                                    pontoReferencia: true,
                              }
                        },
                        Dependente: {
                              select: {
                                    id: true,
                                    tipo: true,
                                    nome: true,
                                    dataNascimento: true,
                                    fotoBase64: true,
                                    cpf: true,
                                    rg: true,
                                    tituloEleitor: true,
                                    secao: true,
                                    zona: true,
                                    localVotacao: true,
                                    cartaoSUS: true,
                                    numeroContato: true,
                                    whatsapp: true,
                                    VinculoModalidade: {
                                          select: {
                                                modalidade: {
                                                      select: {
                                                            nome: true,
                                                      }
                                                }
                                          }
                                    },
                                    endereco: {
                                          select: {
                                                id: true,
                                                cep: true,
                                                bairro: true,
                                                cidade: true,
                                                estado: true,
                                                rua: true,
                                                numero: true,
                                                complemento: true,
                                                pontoReferencia: true,
                                          }
                                    },
                                    createdAt: true,
                                    updatedAt: true,
                              },
                              orderBy: {
                                    createdAt: 'desc',
                              },
                        },
                  },
            });

            if (!foundById) {
                  return null;
            }

            const pessoaHttp = TitularMapper.toHttp({
                  id: foundById.id,
                  nome: foundById.nome,
                  numeroContato: foundById.numeroContato,
                  whatsapp: foundById.whatsapp,
                  dataNascimento: foundById.dataNascimento,
                  cpf: new CPF(foundById.cpf),
                  rg: foundById.rg,
                  createdAt: foundById.createdAt,
                  updatedAt: foundById.updatedAt,
                  fotoBase64: foundById.fotoBase64,
                  localVotacao: foundById.localVotacao,
                  tituloEleitor: foundById.tituloEleitor,
                  zona: foundById.zona,
                  secao: foundById.secao,
                  cartaoSUS: foundById.cartaoSUS,
                  modalidade: foundById.VinculoModalidade.map(vm => vm.modalidade.nome),
                  endereco: {
                        cep: foundById.endereco.cep,
                        bairro: foundById.endereco.bairro,
                        cidade: foundById.endereco.cidade,
                        estado: foundById.endereco.estado,
                        rua: foundById.endereco.rua,
                        numero: foundById.endereco.numero,
                        complemento: foundById.endereco.complemento,
                        pontoReferencia: foundById.endereco.pontoReferencia,
                  },
                  dependentes: foundById.Dependente.map(dep => ({
                        id: dep.id,
                        tipo: dep.tipo,
                        nome: dep.nome,
                        dataNascimento: dep.dataNascimento,
                        cpf: dep.cpf,
                        rg: dep.rg,
                        tituloEleitor: dep.tituloEleitor,
                        zona: dep.zona,
                        secao: dep.secao,
                        localVotacao: dep.localVotacao,
                        cartaoSUS: dep.cartaoSUS,
                        numeroContato: dep.numeroContato,
                        whatsapp: dep.whatsapp,
                        fotoBase64: dep.fotoBase64,
                        modalidade: dep.VinculoModalidade.map(vm => vm.modalidade.nome),
                        endereco: {
                              cep: dep.endereco?.cep ? dep.endereco.cep : '',
                              bairro: dep.endereco?.bairro ? dep.endereco.bairro : '',
                              cidade: dep.endereco?.cidade ? dep.endereco.cidade : '',
                              estado: dep.endereco?.estado ? dep.endereco.estado : '',
                              rua: dep.endereco?.rua ? dep.endereco.rua : '',
                              numero: dep.endereco?.numero ? dep.endereco.numero : '',
                              complemento: dep.endereco?.complemento ? dep.endereco.complemento : '',
                              pontoReferencia: dep.endereco?.pontoReferencia ? dep.endereco.pontoReferencia : '',
                        }
                  })),
            });

            return pessoaHttp

      }

      async findByCPF(cpf: string): Promise<Titular | null> {
            const foundByCpf = await this.repository.titular.findUnique({
                  where: { cpf },
            });

            if (!foundByCpf) return null;

            const pessoa = TitularMapper.toEntity(foundByCpf);
            return TitularMapper.toHttp(pessoa);
      }

      async findAll(
            filters: Partial<FiltersPessoaDTO> = {},
      ): Promise<PaginatedResult<Partial<Titular>>> {
            // paginação via query params
            const page = parseInt(filters.page || '1', 10);
            const limit = parseInt(filters.limit || '10', 10);
            const skip = (page - 1) * limit;

            const where = generateQueryByFiltersForPessoa(filters as FiltersPessoaDTO);

            // conta total sem paginação
            const total = await this.repository.titular.count({ where });

            // busca paginada com dependentes
            const rawData = await this.repository.titular.findMany({
                  where,
                  select: {
                        id: true,
                        nome: true,
                        numeroContato: true,
                        whatsapp: true,
                        dataNascimento: true,
                        zona: true,
                        secao: true,
                        cpf: true,
                        rg: true,
                        createdAt: true,
                        updatedAt: true,
                        VinculoModalidade: {
                              select: {
                                    modalidade: {
                                          select: {
                                                nome: true,
                                          },
                                    },
                              },
                        },
                        Dependente: {
                              select: {
                                    id: true,
                                    tipo: true,
                                    nome: true,
                                    dataNascimento: true,
                                    cpf: true,
                                    rg: true,
                                    fotoBase64: true,
                                    tituloEleitor: true,
                                    zona: true,
                                    secao: true,
                                    localVotacao: true,
                                    cartaoSUS: true,
                                    createdAt: true,
                                    updatedAt: true,
                                    numeroContato: true,
                                    whatsapp: true,
                                    VinculoModalidade: {
                                          select: {
                                                modalidade: {
                                                      select: {
                                                            nome: true,
                                                      },
                                                },
                                          },
                                    },
                              },
                              orderBy: { createdAt: 'desc' },
                        },
                        _count: { select: { Dependente: true } },
                  },
                  orderBy: { nome: 'asc' },
                  skip,
                  take: limit,
            });

            // mapeia para o formato HTTP
            const data = rawData.map(item => {
                  const pessoaHttp = TitularMapper.toHttp({
                        id: item.id,
                        nome: item.nome,
                        numeroContato: item.numeroContato,
                        whatsapp: item.whatsapp,
                        dataNascimento: item.dataNascimento,
                        zona: item.zona,
                        secao: item.secao,
                        cpf: new CPF(item.cpf),
                        rg: item.rg,
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt,
                        modalidade: item.VinculoModalidade.map(vm => vm.modalidade.nome),
                        tipoVinculo: 'Titular',
                        dependentes: item.Dependente.map(dep => ({
                              id: dep.id,
                              nome: dep.nome,
                              dataNascimento: dep.dataNascimento,
                              cpf: dep.cpf,
                              rg: dep.rg,
                              tituloEleitor: dep.tituloEleitor,
                              zona: dep.zona,
                              secao: dep.secao,
                              localVotacao: dep.localVotacao,
                              cartaoSUS: dep.cartaoSUS,
                              tipo: dep.tipo,
                              numeroContato: dep.numeroContato,
                              whatsapp: dep.whatsapp,
                              fotoBase64: dep.fotoBase64,
                              modalidade: dep.VinculoModalidade.map(vm => vm.modalidade.nome),
                              tipoVinculo: 'Dependente',
                        })),
                  });

                  return {
                        ...pessoaHttp,
                        numeroDependentes: item._count.Dependente,
                  };
            });

            const totalPages = Math.ceil(total / limit);

            return {
                  data,
                  total,
                  page,
                  limit,
                  totalPages,
            };
      }

      async update(id: number, data: UpdatePessoaDTO): Promise<Titular> {
            const { userFields, dependentes } = TitularMapper.toPrismaUpdate(data);

            // Remove dependentes antigos
            await this.repository.dependente.deleteMany({
                  where: { titularId: id },
            });

            await this.repository.vinculoModalidade.deleteMany({
                  where: { titularId: id },
            });

            await this.repository.vinculoModalidade.deleteMany({
                  where: {
                        dependenteId: { in: dependentes.map(dep => dep.id) },
                  },
            });

            // Atualiza o titular (sem endereço ainda)
            const updated = await this.repository.titular.update({
                  where: { id },
                  data: {
                        ...userFields,
                        VinculoModalidade: {
                                          create: data.modalidade?.map(modalidadeId => ({
                                                modalidade: { connect: { id: modalidadeId } },
                                          })) || [],
                                    },
                        Dependente: {
                              create: dependentes.map(dep => ({
                                    nome: dep.nome,
                                    dataNascimento: dep.dataNascimento,
                                    cpf: dep.cpf,
                                    rg: dep.rg,
                                    fotoBase64: dep.fotoBase64,
                                    tituloEleitor: dep.tituloEleitor,
                                    zona: dep.zona,
                                    secao: dep.secao,
                                    localVotacao: dep.localVotacao,
                                    cartaoSUS: dep.cartaoSUS,
                                    numeroContato: dep.numeroContato,
                                    whatsapp: dep.whatsapp,
                                    tipo: dep.tipo ?? '',
                                    VinculoModalidade: {
                                          create: dep.modalidade?.map(modalidadeId => ({
                                                modalidade: { connect: { id: modalidadeId } },
                                          })) || [],
                                    },
                              })),
                        },
                  },
                  include: { Dependente: true },
            });

            // Atualiza ou cria endereço do titular
            if (data.endereco) {
                  // Apaga endereço anterior se existir (opcional)
                  await this.repository.endereco.deleteMany({
                        where: { titularId: id },
                  });

                  await this.repository.endereco.create({
                        data: {
                              cep: data.endereco.cep!,
                              rua: data.endereco.rua!,
                              numero: data.endereco.numero!,
                              bairro: data.endereco.bairro!,
                              cidade: data.endereco.cidade!,
                              estado: data.endereco.estado!,
                              complemento: data.endereco.complemento ?? '',
                              pontoReferencia: data.endereco.pontoReferencia ?? '',
                              titular: {
                                    connect: { id },
                              },
                        },
                  });
            }

            // Associa endereços aos novos dependentes (buscando os recém-criados)
            const dependentesCriados = await this.repository.dependente.findMany({
                  where: { titularId: id },
                  select: { id: true, cpf: true },
            });

            for (const dep of dependentes) {
                  const encontrado = dependentesCriados.find(d => d.cpf === dep.cpf);
                  if (dep.endereco && encontrado) {
                        await this.repository.endereco.create({
                              data: {
                                    ...dep.endereco,
                                    dependenteId: encontrado.id,
                              },
                        });
                  }
            }

            // Retorna com os dados atualizados
            const titularFinal = await this.repository.titular.findUnique({
                  where: { id },
                  include: { Dependente: true },
            });

            return TitularMapper.toDomain(titularFinal!);
      }


      async delete(id: number): Promise<void> {
            await this.repository.titular.delete({
                  where: { id },
            });
      }

      async createBulk(data: CreatePessoaDTO[]): Promise<Titular[]> {
            // Mapeia apenas os dados escalares dos titulares (sem dependentes)
            const pessoasScalars = data
                  .map(TitularMapper.toPrismaCreate)
                  .map(({ Dependente, ...scalars }) => scalars);

            await this.repository.titular.createMany({
                  data: pessoasScalars,
                  skipDuplicates: true,
            });

            // Busca os titulares inseridos para obter os IDs
            const inseridas = await this.repository.titular.findMany({
                  where: { cpf: { in: data.map(d => d.cpf) } },
                  select: { id: true, cpf: true },
            });

            // 1. Inserir endereços dos titulares
            const enderecosTitulares = data.flatMap(dto => {
                  const titular = inseridas.find(p => p.cpf === dto.cpf);
                  if (!titular || !dto.endereco) return [];

                  return [{
                        ...dto.endereco,
                        titularId: titular.id,
                  }];
            });

            if (enderecosTitulares.length) {
                  await this.repository.endereco.createMany({
                        data: enderecosTitulares,
                        skipDuplicates: true,
                  });
            }

            // 2. Inserir dependentes
            const dependentesData = data.flatMap(dto => {
                  const titular = inseridas.find(p => p.cpf === dto.cpf);
                  if (!titular || !dto.dependentes) return [];

                  return dto.dependentes.map((dep, index) => ({
                        nome: dep.nome,
                        dataNascimento: new Date(dep.dataNascimento),
                        cpf: dep.cpf,
                        rg: dep.rg,
                        tituloEleitor: dep.tituloEleitor,
                        cartaoSUS: dep.cartaoSUS,
                        numeroContato: dep.numeroContato,
                        whatsapp: dep.whatsapp,
                        secao: dep.secao,
                        zona: dep.zona,
                        tipo: dep.tipo ?? '',
                        titularId: titular.id,
                  }));
            });

            if (dependentesData.length) {
                  await this.repository.dependente.createMany({
                        data: dependentesData,
                        skipDuplicates: true,
                  });
            }

            // 3. Buscar os dependentes inseridos (para associar endereço)
            const todosDependentes = await this.repository.dependente.findMany({
                  where: {
                        titularId: { in: inseridas.map(p => p.id) }
                  },
                  select: {
                        id: true,
                        titularId: true,
                        cpf: true,
                  },
            });

            // 4. Inserir endereços dos dependentes (se houver)
            const enderecosDependentes = data.flatMap(dto => {
                  const titular = inseridas.find(p => p.cpf === dto.cpf);
                  if (!titular || !dto.dependentes) return [];

                  return dto.dependentes.flatMap(dep => {
                        const depInserido = todosDependentes.find(d => d.cpf === dep.cpf && d.titularId === titular.id);
                        if (!depInserido || !dep.endereco) return [];

                        return [{
                              ...dep.endereco,
                              dependenteId: depInserido.id,
                        }];
                  });
            });

            if (enderecosDependentes.length) {
                  await this.repository.endereco.createMany({
                        data: enderecosDependentes,
                        skipDuplicates: true,
                  });
            }

            // 5. Retornar os titulares com dependentes (endereços podem ser incluídos se necessário)
            return this.repository.titular.findMany({
                  where: { id: { in: inseridas.map(p => p.id) } },
                  include: {
                        Dependente: true,
                  },
            }).then(rows => rows.map(TitularMapper.toDomain));
      }


}
