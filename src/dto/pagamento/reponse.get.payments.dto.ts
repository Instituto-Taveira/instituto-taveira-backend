export class ResponseGetPayments {
    id: number;
    status: string;
    checkoutId: string;
    createdAt: Date;
    endedAt?: Date;
    payer?: string;
}