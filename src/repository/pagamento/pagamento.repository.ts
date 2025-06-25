import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dayjs from 'dayjs';

@Injectable()
export class PagamentoRepository {
    private readonly TOKEN = process.env.PAGSEGURO_TOKEN;
    private readonly BASE_URL = process.env.PAGSEGURO_BASE_URL;

    async create() {
        const mesAtual = new Date().getMonth() + 1;

        const dataExpiracao = dayjs().add(1, 'hour').toISOString();

        const response = await axios.post(
            `${this.BASE_URL}/orders`,
            {
                reference_id: `assinatura-taveira-mes-${mesAtual}`,
                customer: {
                    name: 'Cliente Instituto Taveira',
                    email: 'contato@institutotaveira.com',
                    tax_id: '12345678909'
                },
                items: [
                    {
                        name: `Assinatura mensal - Instituto Taveira - Mês ${mesAtual}`,
                        quantity: 1,
                        unit_amount: 50,
                    },
                ],
                qr_codes: [
                    {
                        amount: {
                            value: 50,
                        },
                        expiration_date: dataExpiracao,
                    },
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${this.TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return {
            id: response.data.id,
            qrCodeLink: response.data.qr_codes[0].links[0].href,
        };
    }
}
