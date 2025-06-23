import { Body, Controller, Delete, Get, Param, Patch, Post, SetMetadata } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { IsPublic } from "src/decorators/public.decorator";
import { CreateModalidadeDto } from "src/dto/modalidade/createModalidade.dto";
import { UpdateModalidadeDto } from "src/dto/modalidade/updateModalidade.dto";
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

    @ApiOperation({
        summary: 'Atualizar Modalidade',
        description:
            'Utilize este endpoint para atualizar os dados de uma modalidade.',
    })
    @Patch(':id')
    //   @UseGuards(JwtAuthGuard)
    async update(@Param('id') id: number, @Body() payload: UpdateModalidadeDto): Promise<{ message: string }> {
        await this.modalidadeService.update(Number(id), payload);
        return { message: 'Modalidade atualizada com sucesso!' };
    }

    @Delete(':id')
    async delete(@Param('id') id: number): Promise<{ message: string }> {
        await this.modalidadeService.delete(Number(id));
        return { message: 'Modalidade removida com sucesso!' };
    }

}