import { Controller, Get, HttpException, HttpStatus, Param, Post } from "@nestjs/common";
import { IsPublic } from "src/decorators/public.decorator";
import { CobrancaService } from "src/services/cobranca.service";

@Controller('cobrancas')
export class CobrancaController {
    constructor(
        private readonly cobrancaService: CobrancaService) { }

    @IsPublic()
    @Get()
    async list(): Promise<any> {
        try {
            return await this.cobrancaService.getAll();

        } catch (error) {
            console.log(error)
            throw new HttpException('Erro ao retornar cobranças', HttpStatus.BAD_REQUEST)
        }
    }
}