import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from "@nestjs/common";
import { IsPublic } from "src/decorators/public.decorator";
import { ResponseGetPayments } from "src/dto/pagamento/reponse.get.payments.dto";
import { PagSeguroFullNotificationDto, PagSeguroSimpleNotificationDto } from "src/dto/pagamento/update.status.payment.dto";
import PagamentoService from "src/services/pagamento.service";

@Controller('pagamentos')
export class PagamentoController {
    constructor(
        private readonly pagamentoService: PagamentoService) { }

    @Get('criar')
    async create(): Promise<{}> {
        try {
            await this.pagamentoService.create();

            return { message: "Pagamento criado com sucesso" };

        } catch (error) {
            console.log(`Erro ao criar pagamento: ${error}`);
            throw new HttpException('Erro ao criar pagamento', HttpStatus.BAD_REQUEST)
        }
    }

    @Get('verificar/:id')
    async verify(@Param('id') paymentId: number): Promise<{}> {
        try {
            return await this.pagamentoService.verifyCheckout(+paymentId);
        } catch (error) {
            if (error instanceof Error) {
                throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
            }
            throw new HttpException('Erro ao criar pagamento', HttpStatus.BAD_REQUEST)
        }
    }

    @Get('')
    async getAll(): Promise<ResponseGetPayments[]> {
        try {
            return await this.pagamentoService.findAll();
        } catch (error) {
            throw new HttpException('Erro ao retornar pagamentos', HttpStatus.BAD_REQUEST)
        }
    }

    @IsPublic()
    @Post('webhook')
    async receiveStatus(
        @Body() payload: PagSeguroSimpleNotificationDto | PagSeguroFullNotificationDto,
    ): Promise<void> {

        try {
            if ('notificationCode' in payload && 'notificationType' in payload) {
                return;
            }

            if ('reference_id' in payload && payload.charges?.length) {

                const reference_id = payload.reference_id;
                const status = payload.charges[0].status;
                const payer = payload.customer?.name || null;
                const paymentMethod = payload.charges[0].payment_method?.type || null;
                const amount = payload.items[0].unit_amount;
                const amountPayed = payload.charges[0].amount.value || null

                return await this.pagamentoService.updateStatus(reference_id, status, payer, paymentMethod, amount, amountPayed);
            }

        } catch (error) {
            console.error('Erro ao processar webhook:', error);
            throw new HttpException('Erro ao processar pagamento', HttpStatus.BAD_REQUEST)
        }
    }
}