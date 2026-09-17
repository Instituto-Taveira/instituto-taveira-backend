import { Body, Controller, ForbiddenException, Get, HttpException, HttpStatus, Param, Patch, Post, Request } from "@nestjs/common";
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

    // Baixa manual: marca o pagamento como pago na mao. Apenas o dono do
    // sistema (papel 'owner') pode fazer, e o banco registra quem deu a baixa.
    @Patch('baixa-manual/:id')
    async baixaManual(@Param('id') paymentId: number, @Request() req: any): Promise<{ message: string }> {
        const usuario = req.user;
        if (!usuario || usuario.role !== 'owner') {
            throw new ForbiddenException('Apenas o dono do sistema pode dar baixa manual.');
        }
        try {
            await this.pagamentoService.baixaManual(+paymentId, usuario.name || usuario.login);
            return { message: 'Pagamento baixado manualmente.' };
        } catch (error) {
            throw new HttpException(
                error instanceof Error ? error.message : 'Erro ao dar baixa manual',
                HttpStatus.BAD_REQUEST,
            );
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
                const amountPayed = payload.charges[0].amount.value || null

                return await this.pagamentoService.updateStatus(reference_id, status, payer, paymentMethod, amountPayed);
            }

        } catch (error) {
            console.error('Erro ao processar webhook:', error);
            throw new HttpException('Erro ao processar pagamento', HttpStatus.BAD_REQUEST)
        }
    }
}