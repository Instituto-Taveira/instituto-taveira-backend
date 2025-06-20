import { HttpException, Inject, Injectable } from '@nestjs/common';
import { CPFExistsException } from 'src/common/exceptions/cpf-exists.exception';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { CreatePessoaDTO } from 'src/dto/pessoa/createPessoa.dto';
import { FiltersPessoaDTO } from 'src/dto/pessoa/filterPessoa.dto';
import { UpdatePessoaDTO } from 'src/dto/pessoa/updatePessoa.dto';
import { CPF } from 'src/entities/cpf.entity';
import { Titular } from 'src/entities/titular.entity';
import IPessoaRepository from 'src/repository/pessoa/pessoa.repository.contract';

@Injectable()
export class PessoaService {
      constructor(
            @Inject('IPessoaRepository')
            private readonly pessoaRepository: IPessoaRepository,
      ) { }

      async create(data: CreatePessoaDTO): Promise<Titular> {

            const existPessoa = await this.pessoaRepository.findByCPF(data.cpf);
            if (existPessoa) {
                  throw new CPFExistsException();
            }

            const titular: Titular = new Titular({
                  ...data,
                  cpf: new CPF(data.cpf),
                  updatedAt: new Date(),
                  dependentes: data.dependentes
                        ? data.dependentes.map((dep: any) => ({
                              ...dep,
                              foto: dep.foto ?? '',
                        }))
                        : [],
                  modalidade: Array.isArray(data.modalidade)
                        ? data.modalidade.map((m: any) => String(m))
                        : [],
            });

            return await this.pessoaRepository.create({
                  ...titular,
                  cpf: titular.cpf.getValue(),
                  zona: titular.zona ?? '',
                  secao: titular.secao ?? '',
                  dependentes: titular.dependentes
                        ? titular.dependentes.map((dep: any) => ({
                              ...dep,
                              tipo: dep.tipo ?? '',
                        }))
                        : [],
                  endereco: titular.endereco,
                  modalidade: Array.isArray(titular.modalidade)
                        ? titular.modalidade.map((m: any) => Number(m))
                        : [],
            });
      }

      async findById(id: number): Promise<Titular> {
            const pessoa = await this.pessoaRepository.findById(id);

            if (!pessoa) {
                  throw new HttpException('Pessoa não encontrada!', 404);
            }

            return pessoa;
      }

      async findBirthDays(): Promise<{ pessoas: any[]; dependentes: any[] }> {
            return await this.pessoaRepository.findBirthDays();
      }

      async findAll(
            filters: FiltersPessoaDTO,
      ): Promise<PaginatedResult<Partial<Titular>>> {
            return await this.pessoaRepository.findAll(filters);
      }

      async update(id: number, data: UpdatePessoaDTO): Promise<void> {
            const pessoa = await this.pessoaRepository.findById(id);

            if (!pessoa) {
                  throw new HttpException('Pessoa não encontrada!', 404);
            }

            const outraPessoa = await this.pessoaRepository.findByCPF(data.cpf);

            if (outraPessoa && outraPessoa.id !== id) {
                  throw new HttpException(
                        'Já existe uma pessoa cadastrada com esse CPF!',
                        400,
                  );
            }

            await this.pessoaRepository.update(id, data);
            return;
      }

      async delete(id: number): Promise<void> {
            const pessoa = await this.pessoaRepository.findById(id);

            if (!pessoa) {
                  throw new HttpException('Pessoa não encontrada!', 404);
            }

            await this.pessoaRepository.delete(id);
            return;
      }

      async createBulk(data: CreatePessoaDTO[]): Promise<Titular[]> {
            const pessoas: Titular[] = data.map(dto => new Titular({
                  ...dto,
                  cpf: new CPF(dto.cpf),
                  updatedAt: new Date(),
                  dependentes: dto.dependentes?.map((dep: any) => ({
                        ...dep,
                        foto: dep.foto ?? '',
                  })) ?? [],
                  modalidade: Array.isArray(dto.modalidade)
                        ? dto.modalidade.map((m: any) => String(m))
                        : [],
            }));

            const pessoasDTO: CreatePessoaDTO[] = pessoas.map(pessoa => {
                  const original = data.find(dto => dto.cpf === pessoa.cpf.getValue());

                  return {
                        ...original,
                        ...pessoa,
                        cpf: pessoa.cpf.getValue(),
                        dependentes: pessoa.dependentes?.map((dep: any, index: number) => ({
                              ...original?.dependentes?.[index],
                              ...dep,
                              tipo: dep.tipo ?? original?.dependentes?.[index]?.tipo ?? '',
                        })) ?? [],
                        modalidade: Array.isArray(pessoa.modalidade)
                              ? pessoa.modalidade.map((m: any) => Number(m))
                              : [],
                  };
            });

            return await this.pessoaRepository.createBulk(pessoasDTO);
      }

}
