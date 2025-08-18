import { PrismaService } from "src/config/database/prisma.service";
import { ICobrancaRepository } from "./cobranca.repository.contract";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CobrancaRepository implements ICobrancaRepository {
    constructor(private prisma: PrismaService) { }
    async listAll() {
        const charges = await this.prisma.cobranca.findMany({
            select: {
                id: true,
                createdAt: true,
                startDate: true,
                endDate: true,
                billingDate: true,
                period: true,
                payment: {
                    select: {
                        status: true,
                        checkoutId: true
                    }
                },
            }
        })

        return charges.map(char => {
            return {
                id: char.id,
                createdAt: char.createdAt,
                startDate: char.startDate,
                endDate: char.endDate,
                billingDate: char.billingDate,
                period: char.period,
                payment: char.payment.status
            }
        })

    }
}