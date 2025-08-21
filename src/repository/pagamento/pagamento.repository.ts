import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/config/database/prisma.service';
import { IPagamentoRepository } from './pagamento.repository.contract';
import { CreatePaymentDto } from 'src/dto/pagamento/create.payment.dto';
import { ResponseGetPayments } from 'src/dto/pagamento/reponse.get.payments.dto';

@Injectable()
export class PagamentoRepository implements IPagamentoRepository {
    constructor(private prisma: PrismaService) { }

    async create(data: CreatePaymentDto): Promise<{ id: number }> {

        const payment = await this.prisma.pagamento.create({
            data: {
                ...data
            }
        })

        return {
            id: payment.id
        }

    };

    async createManual(data: CreatePaymentDto): Promise<{ id: number; }> {
        const payment = await this.prisma.pagamento.create({
            data: {
                ...data
            }
        });

        return {
            id: payment.id
        }
    }


    async updateStatus(
        reference_id: string,
        status: Prisma.EnumStatusFieldUpdateOperationsInput,
        payer: string,
        paymentMethod: string,
        amountPayed: number
    ): Promise<any> {

        await this.prisma.pagamento.update({
            where: {
                reference_id: reference_id
            },
            data: {
                status: status,
                payer: payer,
                endedAt: new Date(),
                paymentMethod: paymentMethod,
                amountPayed: amountPayed
            }
        })
    }

    async findAllPayments(): Promise<ResponseGetPayments[]> {
        return await this.prisma.pagamento.findMany();
    }

    async findPaymentById(paymentId: number): Promise<ResponseGetPayments> {
        return await this.prisma.pagamento.findUnique({
            where: {
                id: paymentId
            }
        })
    }


}
