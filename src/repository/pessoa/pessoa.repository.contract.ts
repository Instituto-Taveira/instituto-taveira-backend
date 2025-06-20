import { Titular } from '../../entities/titular.entity';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { CreatePessoaDTO } from 'src/dto/pessoa/createPessoa.dto';
import { FiltersPessoaDTO } from 'src/dto/pessoa/filterPessoa.dto';
import { UpdatePessoaDTO } from 'src/dto/pessoa/updatePessoa.dto';

export default interface IPessoaRepository {
      create(data: CreatePessoaDTO): Promise<Titular>;
      findById(id: number): Promise<Titular | null>;
      findBirthDays(): Promise<{ pessoas: any[]; dependentes: any[] }>;
      findByCPF(cpf: string): Promise<Titular | null>;
      findAll(
            filters?: FiltersPessoaDTO,
      ): Promise<PaginatedResult<Partial<Titular>>>;
      update(id: number, data: UpdatePessoaDTO): Promise<Titular>;
      delete(id: number): Promise<void>;
      createBulk(data: CreatePessoaDTO[]): Promise<Titular[]>;
      
}
