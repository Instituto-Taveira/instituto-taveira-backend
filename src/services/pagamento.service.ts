import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import axios from 'axios';
import { ResponseGetPayments } from 'src/dto/pagamento/reponse.get.payments.dto';
import { ResponsePaymentDto } from 'src/dto/pagamento/response.payment.dto';
import { IPagamentoRepository } from 'src/repository/pagamento/pagamento.repository.contract';

@Injectable()
export default class PagamentoService {
    constructor(
        @Inject(IPagamentoRepository)
        private readonly pagamentoRepository: IPagamentoRepository
    ) { }

    private readonly TOKEN = process.env.PAGSEGURO_TOKEN;
    private readonly BASE_URL = process.env.PAGSEGURO_BASE_URL;

    async listById(paymentId: number): Promise<ResponseGetPayments> {
        try {
            return await this.pagamentoRepository.findPaymentById(paymentId);
        } catch (error) {
            console.log(error);
            throw new Error('Erro ao localizar pagamento')
        }
    }

    async invalidateCheckout(checkoutId: string): Promise<void> {
        try {
            const response = await axios.post(
                `${this.BASE_URL}/checkouts/${checkoutId}/inactivate`,
                null,
                {
                    headers: {
                        Authorization: `Bearer ${this.TOKEN}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status != 200) {
                throw new Error('Erro ao desativar checkout')
            }

        } catch (error) {

            if (error instanceof Error) {
                throw new Error(error.message);
            }

            throw new Error("Erro interno ao invalidar checkout")
        }
    }

    async verifyCheckout(paymentId: number): Promise<ResponsePaymentDto> {
        try {

            const payment = await this.listById(paymentId);

            if (!payment) {
                throw new Error('Pagamento não encontrado')
            } 

            const response = await axios.get(
                `${this.BASE_URL}/checkouts/${payment.checkoutId}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.TOKEN}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response) {
                throw new Error("Checkout não encontrado");
            }

            if (!response.data.orders) {
                return {
                    message: 'Este checkout está pendente',
                    link: response.data.links.find((lin: any) => lin.rel === "PAY")?.href
                }
            }

            // percorre os orders
            for (const order of response.data.orders) {
                // faz o GET para buscar detalhes da order
                const orderResponse = await axios.get(
                    `${this.BASE_URL}/orders/${order.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${this.TOKEN}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                const charges = orderResponse.data.charges;

                if (charges && Array.isArray(charges)) {
                    for (const charge of charges) {

                        if (charge.status === "PAID") {

                            await this.invalidateCheckout(payment.checkoutId);

                            return {
                                message: "Pagamento confirmado!"
                            }
                        }

                        return {
                            message: "Este checkout está pendente",
                            link: response.data.links.find((lin: any) => lin.rel === "PAY")?.href
                        }
                    }
                }
            }

            throw new Error("Nenhum pagamento aprovado encontrado");
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error("Erro ao verificar pagamento");
        }
    }


    async create(): Promise<{ id: number }> {
        try {
            const mesAtual = new Date().getMonth() + 1;
            const anoAtual = new Date().getFullYear();
            const ref_id = `assinatura_taveira_${Date.now().toString()}_${mesAtual}_${anoAtual}`;
            const response = await axios.post(
                `${this.BASE_URL}/checkouts`,
                {
                    reference_id: ref_id,
                    items: [
                        {
                            name: `Assinatura mensal - Instituto Taveira - Mês ${mesAtual}`,
                            quantity: 1,
                            unit_amount: 5000,
                        },
                    ],
                    payment_notification_urls: ['https://b055f52e8267.ngrok-free.app/pagamentos/webhook'],
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const data = {
                reference_id: ref_id,
                checkoutId: response.data.id,
            }

            return this.pagamentoRepository.create(data);

        } catch (error) {
            throw new Error(`Error creating payment: ${error.message}`);
        }
    }

    async updateStatus(
        reference_id: string,
        status: Prisma.EnumStatusFieldUpdateOperationsInput,
        payer: string,
        paymentMethod: string,
        amount: number,
        amountPayed: number

    ): Promise<void> {
        try {
            await this.pagamentoRepository.updateStatus(
                reference_id,
                status,
                payer,
                paymentMethod,
                amount,
                amountPayed
            );
        } catch (error) {
            throw new Error(`Error creating payment: ${error.message}`);
        }
    }

    async findAll(): Promise<ResponseGetPayments[]> {
        try {
            return await this.pagamentoRepository.findAllPayments();
        } catch (error) {
            throw new Error('Erro ao retornar pagamentos')
        }
    }

}