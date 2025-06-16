import { Pessoa } from '../../entities/pessoa.entity';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { CreatePessoaDTO } from 'src/dto/pessoa/createPessoa.dto';
import { FiltersPessoaDTO } from 'src/dto/pessoa/filterPessoa.dto';

export default interface IPessoaRepository {
      create(data: Pessoa): Promise<Pessoa>;
      findById(id: string): Promise<Pessoa | null>;
      findByCPF(cpf: string): Promise<Pessoa | null>;
      findAll(
            filters?: FiltersPessoaDTO,
      ): Promise<PaginatedResult<Partial<Pessoa>>>;
      update(id: string, data: CreatePessoaDTO): Promise<Pessoa>;
      delete(id: string): Promise<void>;
}
