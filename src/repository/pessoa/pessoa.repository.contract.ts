import { Pessoa } from '../../entities/pessoa.entity';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { CreatePessoaDTO } from 'src/dto/pessoa/createPessoa.dto';
import { FiltersPessoaDTO } from 'src/dto/pessoa/filterPessoa.dto';

export default interface IPessoaRepository {
      create(data: CreatePessoaDTO): Promise<Pessoa>;
      findById(id: number): Promise<Pessoa | null>;
      findBirthDays(): Promise<{ pessoas: any[]; dependentes: any[] }>;
      findByCPF(cpf: string): Promise<Pessoa | null>;
      findAll(
            filters?: FiltersPessoaDTO,
      ): Promise<PaginatedResult<Partial<Pessoa>>>;
      update(id: number, data: CreatePessoaDTO): Promise<Pessoa>;
      delete(id: number): Promise<void>;
      createBulk(data: CreatePessoaDTO[]): Promise<Pessoa[]>;
      
}
