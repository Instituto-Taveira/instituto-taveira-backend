import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { IPagamentoRepository } from 'src/repository/pagamento/pagamento.repository.contract';

@Injectable()
export default class PagamentoService {
    constructor(
        @Inject('IPagamentoRepository')
        private readonly pagamentoRepository: IPagamentoRepository
    ) { }

    async create(): Promise<any> {
        try {
            return await this.pagamentoRepository.create();
        } catch (error) {
            throw new Error(`Error creating payment: ${error.message}`);
        }
    }

}