export interface ICobrancaRepository {
    create(data: any, paymentId: number): Promise<any>;
    listAll(): Promise<any>;
}

export const ICobrancaRepository = Symbol('ICobrancaRepository');