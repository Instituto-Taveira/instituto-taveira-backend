import { CreateModalidadeDto } from "src/dto/modalidade/createModalidade.dto";
import { Modalidade } from "src/entities/modalidade.entity";


export default interface IModalidadeResitory {

    findByNome(nome: string): Promise<Modalidade | null>;
    create(payload: CreateModalidadeDto): Promise<Modalidade>;
    findAll(): Promise<Modalidade[]>;
    findInfos();

}