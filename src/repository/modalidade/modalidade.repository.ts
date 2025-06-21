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

    async findInfos() {
        const infos = await this.repository.vinculoModalidade.groupBy({
            by: ['modalidadeId'],
            _count: {
                dependenteId: true,
                titularId: true
            }
        });

        return infos.map(info => ({
            modalidadeId: info.modalidadeId,
            total: info._count.dependenteId + info._count.titularId
        }));
    }


    async findAll(): Promise<Modalidade[]> {
        return await this.repository.modalidade.findMany({
        });
    }

}