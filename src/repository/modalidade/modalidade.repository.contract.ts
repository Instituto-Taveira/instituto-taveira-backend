import { CreateModalidadeDto } from "src/dto/modalidade/createModalidade.dto";
import { UpdateModalidadeDto } from "src/dto/modalidade/updateModalidade.dto";
import { Modalidade } from "src/entities/modalidade.entity";


export default interface IModalidadeResitory {

    findByNome(nome: string): Promise<Modalidade | null>;
    create(payload: CreateModalidadeDto): Promise<Modalidade>;
    findAll(): Promise<Modalidade[]>;
    findInfos();
    update(id: number, payload: UpdateModalidadeDto): Promise<{ message: string }>;
    delete(id: number): Promise<{ message: string }>;

}