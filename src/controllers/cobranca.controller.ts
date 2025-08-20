import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from "@nestjs/common";
import { IsPublic } from "src/decorators/public.decorator";
import { CobrancaService } from "src/services/cobranca.service";

@Controller('cobrancas')
export class CobrancaController {
    constructor(
        private readonly cobrancaService: CobrancaService) { }

    @Post()
    async createManual(@Body() data: any): Promise<any> {
        try {
            return await this.cobrancaService.createCobranca(data, null);

        } catch (error) {
            console.log(error)
            throw new HttpException('Erro ao criar cobrança', HttpStatus.BAD_REQUEST)
        }
    }

    @Get()
    async listAll(): Promise<any> {
        try {
            return await this.cobrancaService.getAll();

        } catch (error) {
            console.log(error)
            throw new HttpException('Erro ao retornar cobranças', HttpStatus.BAD_REQUEST)
        }
    }
}