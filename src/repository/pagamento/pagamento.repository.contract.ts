import { Prisma } from "@prisma/client";
import { CreatePaymentDto } from "src/dto/pagamento/create.payment.dto";
import { ResponseGetPayments } from "src/dto/pagamento/reponse.get.payments.dto";

export interface IPagamentoRepository {
    create(data: CreatePaymentDto): Promise<{ id: number }>;
    updateStatus(
        reference_id: string,
        status: Prisma.EnumStatusFieldUpdateOperationsInput,
        payer: string,
        paymentMethod: string,
        amount: number,
        amountPayed: number
    ): Promise<void>;
    findAllPayments(): Promise<ResponseGetPayments[]>;
    findPaymentById(paymentId: number): Promise<ResponseGetPayments>;
}

export const IPagamentoRepository = Symbol('IPagamentoRepository');