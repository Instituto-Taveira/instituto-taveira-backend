import { HttpException, Inject, Injectable } from '@nestjs/common';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { CreatePessoaDTO } from 'src/dto/pessoa/createPessoa.dto';
import { FiltersPessoaDTO } from 'src/dto/pessoa/filterPessoa.dto';
import { Pessoa } from 'src/entities/pessoa.entity';
import IPessoaRepository from 'src/repository/pessoa/pessoa.repository.contract';

@Injectable()
export class PessoaService {
      constructor(
            @Inject('IPessoaRepository')
            private readonly pessoaRepository: IPessoaRepository,
      ) {}

      async create(data: CreatePessoaDTO): Promise<Pessoa> {
            const existPessoa = await this.pessoaRepository.findByCPF(data.cpf);

            if (existPessoa) {
                  throw new HttpException(
                        'Pessoa com esse CPF já cadastrada!',
                        400,
                  );
            }

            const pessoa: Pessoa = new Pessoa({
                  ...data,
                  updatedAt: new Date(),
            });

            return await this.pessoaRepository.create(pessoa);
      }

      async findById(id: string): Promise<Pessoa> {
            const pessoa = await this.pessoaRepository.findById(id);

            if (!pessoa) {
                  throw new HttpException('Pessoa não encontrada!', 404);
            }

            return pessoa;
      }

      async findAll(
            filters: FiltersPessoaDTO,
      ): Promise<PaginatedResult<Partial<Pessoa>>> {
            return await this.pessoaRepository.findAll(filters);
      }

      async update(id: string, data: CreatePessoaDTO): Promise<void> {
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

      async delete(id: string): Promise<void> {
            const pessoa = await this.pessoaRepository.findById(id);

            if (!pessoa) {
                  throw new HttpException('Pessoa não encontrada!', 404);
            }

            await this.pessoaRepository.delete(id);
            return;
      }
}
