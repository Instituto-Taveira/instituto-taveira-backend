export class CreatePaymentDto {
    billingDate?: Date;
    endDate?: Date;
    period?: string;
    startDate?: Date;
    reference_id: string;
    checkoutId: string;
}