export default class PedidoPagamento {
    reference_id: string;
    description: string;
    ammount: {
        value: number;
        currency: string;
    };
    payment_method: { type: string };

    constructor(id: string, ammount: { value: number, currency: string }, payment_method: { type: string }) {
        this.reference_id = id;
        this.ammount = ammount;
        this.payment_method = payment_method;
    }

}