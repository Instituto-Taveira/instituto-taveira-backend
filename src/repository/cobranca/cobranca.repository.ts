import { PrismaService } from "src/config/database/prisma.service";
import { ICobrancaRepository } from "./cobranca.repository.contract";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CobrancaRepository implements ICobrancaRepository {
    constructor(private prisma: PrismaService) { }

    async create(data: any, paymentId: number): Promise<any> {

        console.log(data);

        return await this.prisma.cobranca.create({
            data: {
                period: data.period,
                billingDate: data.billingDate,
                startDate: data.startDate,
                endDate: data.endDate,
                payment: {
                    connect: {
                        id: paymentId
                    }
                }
            }
        })
    }

    async listAll() {
        return await this.prisma.cobranca.findMany({
            select: {
                id: true,
                createdAt: true,
                startDate: true,
                endDate: true,
                billingDate: true,
                period: true,
                payment: {
                    select: {
                        id: true,
                        status: true,
                    }
                },
            }
        })
    }
}