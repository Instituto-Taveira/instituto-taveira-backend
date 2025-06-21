import { HttpException, Inject } from "@nestjs/common";
import { CreateModalidadeDto } from "src/dto/modalidade/createModalidade.dto";
import IModalidadeRepository from "src/repository/modalidade/modalidade.repository.contract";

export class ModalidadeService {
    constructor(
        @Inject('IModalidadeRepository')
        private readonly modalidadeRepository: IModalidadeRepository) { }

    async create(payload: CreateModalidadeDto) {

        const modalidadeExists = await this.modalidadeRepository.findByNome(payload.nome);

        if (modalidadeExists) {
            throw new HttpException('Modalidade já cadastrada!', 400);
        }

        return await this.modalidadeRepository.create(payload);
    }

    async findAll() {
        return await this.modalidadeRepository.findAll();
    }

    async findInfos() {
        return await this.modalidadeRepository.findInfos();
    }

}