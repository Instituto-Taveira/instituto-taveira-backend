import { Controller, Get } from "@nestjs/common";
import { IsPublic } from "src/decorators/public.decorator";
import PagamentoService from "src/services/pagamento.service";

@Controller('pagamento')
export class PagamentoController {
    constructor(
        private readonly pagamentoService: PagamentoService) { }


    @IsPublic()
    @Get('criar')
    async createPayment(): Promise<any> {
        try {
            const payment = await this.pagamentoService.create();
            return payment;
        } catch (error) {
            console.log(`Error creating payment: ${error}`);
            throw new Error(`Error creating payment:`);
        }
    }
}