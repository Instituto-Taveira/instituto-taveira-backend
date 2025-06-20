import { CreateModalidadeDto } from "src/dto/modalidade/createModalidade.dto";
import IModalidadeResitory from "./modalidade.repository.contract";
import { PrismaService } from "src/config/database/prisma.service";
import { Modalidade } from "src/entities/modalidade.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ModalidadeRepository implements IModalidadeResitory {
    constructor(private readonly repository: PrismaService) { }

    async findByNome(nome: string): Promise<Modalidade | null> {
        return await this.repository.modalidade.findUnique({
            where: {
                nome: nome
            }
        })
    }

    async create(payload: CreateModalidadeDto): Promise<Modalidade> {
        return await this.repository.modalidade.create({
            data: {
                ...payload
            }
        })
    }

    async findAll(): Promise<Modalidade[]> {
        return await this.repository.modalidade.findMany();
    }

}