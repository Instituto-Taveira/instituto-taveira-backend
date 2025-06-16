import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/prisma.service';
import { Pessoa } from 'src/entities/pessoa.entity';
import { CreatePessoaDTO } from 'src/dto/pessoa/createPessoa.dto';
import IPessoaRepository from './pessoa.repository.contract';
import { FiltersPessoaDTO } from 'src/dto/pessoa/filterPessoa.dto';
import { generateQueryByFiltersForPessoa } from 'src/config/database/Queries';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';

@Injectable()
export class PessoaRepository implements IPessoaRepository {
      constructor(private readonly repository: PrismaService) {}

      async create(data: Pessoa): Promise<Pessoa> {
            return await this.repository.pessoa.create({
                  data: {
                        id: data.id,
                        nome: data.nome,
                        dataNascimento: data.dataNascimento,
                        cpf: data.cpf,
                        rg: data.rg,
                        tituloEleitor: data.tituloEleitor,
                        localVotacao: data.localVotacao,
                        cartaoSUS: data.cartaoSUS,
                        numeroContato: data.numeroContato,
                        whatsapp: data.whatsapp,
                        endereco: data.endereco,
                        rua: data.rua,
                        numero: data.numero,
                        bairro: data.bairro,
                        complemento: data.complemento,
                        pontoReferencia: data.pontoReferencia,
                        cidade: data.cidade,
                        estado: data.estado,
                        cep: data.cep,
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt,
                        fotoBase64: data.fotoBase64,
                        dependenteDeId: data.dependenteDeId,
                  },
            });
      }

      async findById(id: string): Promise<Pessoa | null> {
            return await this.repository.pessoa.findUnique({
                  where: { id },
            });
      }

      async findByCPF(cpf: string): Promise<Pessoa | null> {
            return await this.repository.pessoa.findUnique({
                  where: { cpf },
            });
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

            const data = await this.repository.pessoa.findMany({
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
                  },
                  orderBy: {
                        createdAt: 'desc',
                  },
                  skip: skip,
                  take: limit,
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

      async update(id: string, data: CreatePessoaDTO): Promise<Pessoa> {
            return await this.repository.pessoa.update({
                  where: { id },
                  data: {
                        nome: data.nome,
                        dataNascimento: data.dataNascimento,
                        cpf: data.cpf,
                        rg: data.rg,
                        tituloEleitor: data.tituloEleitor,
                        localVotacao: data.localVotacao,
                        cartaoSUS: data.cartaoSUS,
                        numeroContato: data.numeroContato,
                        whatsapp: data.whatsapp,
                        endereco: data.endereco,
                        rua: data.rua,
                        numero: data.numero,
                        bairro: data.bairro,
                        complemento: data.complemento,
                        pontoReferencia: data.pontoReferencia,
                        cidade: data.cidade,
                        estado: data.estado,
                        cep: data.cep,
                        fotoBase64: data.fotoBase64,
                        dependenteDeId: data.dependenteDeId,
                        updatedAt: new Date(),
                  },
            });
      }

      async delete(id: string): Promise<void> {
            await this.repository.pessoa.delete({
                  where: { id },
            });
      }
}
