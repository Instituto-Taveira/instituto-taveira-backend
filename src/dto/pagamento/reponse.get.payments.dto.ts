export class ResponseGetPayments {
    id: number;
    reference_id: string;
    status: string;
    checkoutId: string;
    createdAt: Date;
    endedAt?: Date;
    payer?: string;
}