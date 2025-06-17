import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/prisma.service';
import { Pessoa } from 'src/entities/pessoa.entity';
import { CreatePessoaDTO } from 'src/dto/pessoa/createPessoa.dto';
import IPessoaRepository from './pessoa.repository.contract';
import { FiltersPessoaDTO } from 'src/dto/pessoa/filterPessoa.dto';
import { generateQueryByFiltersForPessoa } from 'src/config/database/Queries';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { PessoaMapper } from 'src/mappers/pessoa.mapper';
import { CPF } from 'src/entities/cpf.entity';
import { UpdatePessoaDTO } from 'src/dto/pessoa/updatePessoa.dto';

@Injectable()
export class PessoaRepository implements IPessoaRepository {
      constructor(private readonly repository: PrismaService) { }

      async create(data: CreatePessoaDTO): Promise<Pessoa> {

            const dataMapper = PessoaMapper.toPrismaCreate(data);
            const created = await this.repository.pessoa.create({
                  data: dataMapper,
                  include: { Dependente: true },
            });

            return PessoaMapper.toDomain(created);
      }

      async findBirthDays(): Promise<{ pessoas: any[]; dependentes: any[] }> {
            const now = new Date();
            const currentMonth = now.getMonth(); // 0 = janeiro, …, 11 = dezembro

            const [allPessoas, allDependentes] = await Promise.all([
                  this.repository.pessoa.findMany({
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
                              pessoaId: true,
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

            console.log('Pessoas Aniversariantes:', pessoas);
            console.log('Dependentes Aniversariantes:', dependentes);

            return { pessoas, dependentes };
      }


      async findById(id: number): Promise<Pessoa | null> {

            const foundById = await this.repository.pessoa.findUnique({
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
                        bairro: true,
                        cidade: true,
                        estado: true,
                        cep: true,
                        endereco: true,
                        rua: true,
                        numero: true,
                        complemento: true,
                        pontoReferencia: true,
                        fotoBase64: true,
                        cartaoSUS: true,
                        tituloEleitor: true,
                        localVotacao: true,
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
                                    localVotacao: true,
                                    cartaoSUS: true,
                                    bairro: true,
                                    cidade: true,
                                    estado: true,
                                    cep: true,
                                    rua: true,
                                    numero: true,
                                    numeroContato: true,
                                    whatsapp: true,
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

            const pessoaHttp = PessoaMapper.toHttp({
                  id: foundById.id,
                  nome: foundById.nome,
                  numeroContato: foundById.numeroContato,
                  whatsapp: foundById.whatsapp,
                  dataNascimento: foundById.dataNascimento,
                  cpf: new CPF(foundById.cpf),
                  rg: foundById.rg,
                  createdAt: foundById.createdAt,
                  updatedAt: foundById.updatedAt,
                  bairro: foundById.bairro,
                  cidade: foundById.cidade,
                  estado: foundById.estado,
                  cep: foundById.cep,
                  endereco: foundById.endereco,
                  rua: foundById.rua,
                  numero: foundById.numero,
                  complemento: foundById.complemento,
                  pontoReferencia: foundById.pontoReferencia,
                  fotoBase64: foundById.fotoBase64,
                  localVotacao: foundById.localVotacao,
                  tituloEleitor: foundById.tituloEleitor,
                  cartaoSUS: foundById.cartaoSUS,
                  dependentes: foundById.Dependente.map(dep => ({
                        id: dep.id,
                        tipo: dep.tipo,
                        nome: dep.nome,
                        dataNascimento: dep.dataNascimento,
                        cpf: dep.cpf,
                        rg: dep.rg,
                        tituloEleitor: dep.tituloEleitor,
                        localVotacao: dep.localVotacao,
                        cartaoSUS: dep.cartaoSUS,
                        bairro: dep.bairro,
                        cidade: dep.cidade,
                        estado: dep.estado,
                        cep: dep.cep,
                        rua: dep.rua,
                        numero: dep.numero,
                        numeroContato: dep.numeroContato,
                        whatsapp: dep.whatsapp,
                        fotoBase64: dep.fotoBase64,
                  })),
            });

            return pessoaHttp

      }

      async findByCPF(cpf: string): Promise<Pessoa | null> {
            const foundByCpf = await this.repository.pessoa.findUnique({
                  where: { cpf },
            });

            if (!foundByCpf) return null;

            const pessoa = PessoaMapper.toEntity(foundByCpf);
            return PessoaMapper.toHttp(pessoa);
      }

      async findAll(
            filters: FiltersPessoaDTO,
      ): Promise<PaginatedResult<Partial<Pessoa>>> {
            const page = parseInt(filters.page || '1', 10);
            const limit = parseInt(filters.limit || '10', 10);
            const skip = (page - 1) * limit;

            const where = generateQueryByFiltersForPessoa(filters);

            const total = await this.repository.pessoa.count({
                  where,
            });

            const rawData = await this.repository.pessoa.findMany({
                  where,
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
                                    localVotacao: true,
                                    cartaoSUS: true,
                                    bairro: true,
                                    cidade: true,
                                    estado: true,
                                    cep: true,
                                    rua: true,
                                    numero: true,
                                    createdAt: true,
                                    updatedAt: true,
                                    numeroContato: true,
                                    whatsapp: true,
                              },
                              orderBy: {
                                    createdAt: 'desc',
                              },
                        },
                        _count: {
                              select: {
                                    Dependente: true,
                              },
                        },
                  },
                  orderBy: {
                        createdAt: 'desc',
                  },
                  skip: skip,
                  take: limit,
            });

            const data = rawData.map(item => {
                  const pessoaHttp = PessoaMapper.toHttp({
                        id: item.id,
                        nome: item.nome,
                        numeroContato: item.numeroContato,
                        whatsapp: item.whatsapp,
                        dataNascimento: item.dataNascimento,
                        cpf: new CPF(item.cpf),
                        rg: item.rg,
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt,
                        dependentes: item.Dependente.map(dep => ({
                              id: dep.id,
                              nome: dep.nome,
                              dataNascimento: dep.dataNascimento,
                              cpf: dep.cpf,
                              rg: dep.rg,
                              tituloEleitor: dep.tituloEleitor,
                              localVotacao: dep.localVotacao,
                              cartaoSUS: dep.cartaoSUS,
                              cep: dep.cep,
                              rua: dep.rua,
                              numero: dep.numero,
                              bairro: dep.bairro,
                              cidade: dep.cidade,
                              estado: dep.estado,
                              tipo: dep.tipo,
                              numeroContato: dep.numeroContato,
                              whatsapp: dep.whatsapp,
                              fotoBase64: dep.fotoBase64,
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

      async update(id: number, data: UpdatePessoaDTO): Promise<Pessoa> {
            const { userFields, dependentes } = PessoaMapper.toPrismaUpdate(data);

            await this.repository.dependente.deleteMany({
                  where: { pessoaId: id },
            });

            const updated = await this.repository.pessoa.update({
                  where: { id },
                  data: {
                        ...userFields,
                        Dependente: {
                              create: dependentes.map(dep => ({
                                    nome: dep.nome,
                                    dataNascimento: dep.dataNascimento,
                                    cpf: dep.cpf,
                                    rg: dep.rg,
                                    fotoBase64: dep.fotoBase64,
                                    tituloEleitor: dep.tituloEleitor,
                                    localVotacao: dep.localVotacao,
                                    cartaoSUS: dep.cartaoSUS,
                                    numeroContato: dep.numeroContato,
                                    whatsapp: dep.whatsapp,
                              })),
                        }
                  },
                  include: { Dependente: true }
            });

            return PessoaMapper.toDomain(updated);
      }

      async delete(id: number): Promise<void> {
            await this.repository.pessoa.delete({
                  where: { id },
            });
      }

      async createBulk(data: CreatePessoaDTO[]): Promise<Pessoa[]> {
            const pessoasScalars = data.map(PessoaMapper.toPrismaCreate)
                  .map(({ Dependente, ...scalars }) => scalars);
            await this.repository.pessoa.createMany({
                  data: pessoasScalars,
                  skipDuplicates: true,
            });

            const inseridas = await this.repository.pessoa.findMany({
                  where: { cpf: { in: data.map(d => d.cpf) } },
                  select: { id: true, cpf: true },
            });

            const dependentesData = data.flatMap(dto => {
                  const pessoa = inseridas.find(p => p.cpf === dto.cpf);
                  if (!pessoa || !dto.dependentes) return [];

                  return dto.dependentes.map(dep => ({
                        nome: dep.nome,
                        dataNascimento: new Date(dep.dataNascimento),
                        cpf: dep.cpf,
                        rg: dep.rg,
                        tituloEleitor: dep.tituloEleitor,
                        cartaoSUS: dep.cartaoSUS,
                        numeroContato: dep.numeroContato,
                        whatsapp: dep.whatsapp,
                        pessoaId: pessoa.id,
                  }));
            });

            if (dependentesData.length) {
                  await this.repository.dependente.createMany({
                        data: dependentesData,
                        skipDuplicates: true,
                  });
            }

            return this.repository.pessoa.findMany({
                  where: { id: { in: inseridas.map(p => p.id) } },
                  include: { Dependente: true },
            }).then(rows => rows.map(PessoaMapper.toDomain));
      }

}
