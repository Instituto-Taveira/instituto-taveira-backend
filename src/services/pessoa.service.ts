import { HttpException, Inject, Injectable } from '@nestjs/common';
import { CPFExistsException } from 'src/common/exceptions/cpf-exists.exception';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { CreatePessoaDTO } from 'src/dto/pessoa/createPessoa.dto';
import { FiltersPessoaDTO } from 'src/dto/pessoa/filterPessoa.dto';
import { CPF } from 'src/entities/cpf.entity';
import { Pessoa } from 'src/entities/pessoa.entity';
import IPessoaRepository from 'src/repository/pessoa/pessoa.repository.contract';

@Injectable()
export class PessoaService {
      constructor(
            @Inject('IPessoaRepository')
            private readonly pessoaRepository: IPessoaRepository,
      ) { }

      async create(data: CreatePessoaDTO): Promise<Pessoa> {

            const existPessoa = await this.pessoaRepository.findByCPF(data.cpf);
            if (existPessoa) {
                  throw new CPFExistsException();
            }

            const pessoa: Pessoa = new Pessoa({
                  ...data,
                  cpf: new CPF(data.cpf),
                  updatedAt: new Date(),
                  dependentes: data.dependentes
                        ? data.dependentes.map((dep: any) => ({
                              ...dep,
                              foto: dep.foto ?? '',
                        }))
                        : [],
            });

            return await this.pessoaRepository.create({
                  ...pessoa,
                  cpf: pessoa.cpf.getValue(),
                  zona: pessoa.zona ?? '', // Ensure zona is present
                  secao: pessoa.secao ?? '', // Ensure secao is present
                  dependentes: pessoa.dependentes
                        ? pessoa.dependentes.map((dep: any) => ({
                              ...dep,
                              tipo: dep.tipo ?? '',
                        }))
                        : [],
            });
      }

      async findById(id: number): Promise<Pessoa> {
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
      ): Promise<PaginatedResult<Partial<Pessoa>>> {
            return await this.pessoaRepository.findAll(filters);
      }

      async update(id: number, data: CreatePessoaDTO): Promise<void> {
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

      async createBulk(data: CreatePessoaDTO[]): Promise<Pessoa[]> {
            const pessoas: Pessoa[] = data.map(dto => new Pessoa({
                  ...dto,
                  cpf: new CPF(dto.cpf),
                  updatedAt: new Date(),
                  dependentes: dto.dependentes
                        ? dto.dependentes.map((dep: any) => ({
                              ...dep,
                              foto: dep.foto ?? '',
                        }))
                        : [],
            }));

            const pessoasDTO: CreatePessoaDTO[] = pessoas.map(pessoa => ({
                  ...data.find(dto => dto.cpf === pessoa.cpf.getValue()),
                  ...pessoa,
                  cpf: pessoa.cpf.getValue(),
                  dependentes: pessoa.dependentes
                        ? pessoa.dependentes.map((dep: any) => ({
                              ...dep,
                              tipo: dep.tipo ?? '',
                        }))
                        : [],
            }));

            return await this.pessoaRepository.createBulk(pessoasDTO);
      }

}
