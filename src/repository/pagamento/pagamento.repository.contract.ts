import PedidoPagamento from "src/entities/pagamento.entity";

export interface IPagamentoRepository {
    create(): Promise<any>;
}