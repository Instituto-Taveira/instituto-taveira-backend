import { Body, Controller, Get, Post } from "@nestjs/common";
import { IsPublic } from "src/decorators/public.decorator";
import { CreateModalidadeDto } from "src/dto/modalidade/createModalidade.dto";
import { Modalidade } from "src/entities/modalidade.entity";
import { ModalidadeService } from "src/services/modalidade.service";

@Controller('api/modalidade')
export class ModalidadeController {
    constructor(private readonly modalidadeService: ModalidadeService) { }

    @Post()
    async createModalidade(@Body() payload: CreateModalidadeDto): Promise<Modalidade> {
        return await this.modalidadeService.create(payload);
    }

    @Get()
    async findAllModalidades(): Promise<Modalidade[]> {
        return await this.modalidadeService.findAll();
    }

    @Get('infos')
    @IsPublic()
    async findInfos() {
        return await this.modalidadeService.findInfos();
    }

}