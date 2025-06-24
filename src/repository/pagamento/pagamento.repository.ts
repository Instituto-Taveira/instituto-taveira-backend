import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dayjs from 'dayjs';

@Injectable()
export class PagamentoRepository {
    private readonly TOKEN = 'cc9116d3-b202-4645-bb76-afe85b485fd8adcc84044a3fa4f4c31a772c1cc3dbaf3723-8967-41f7-b7fb-997ba4ac117b';
    private readonly BASE_URL = 'https://sandbox.api.pagseguro.com';

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
