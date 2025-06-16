import {
      Body,
      Controller,
      Delete,
      Get,
      HttpCode,
      HttpStatus,
      Param,
      Patch,
      Post,
      Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsPublic } from 'src/decorators/public.decorator';
import { CreatePessoaDTO } from 'src/dto/pessoa/createPessoa.dto';
import { FiltersPessoaDTO } from 'src/dto/pessoa/filterPessoa.dto';
import { Pessoa } from 'src/entities/pessoa.entity';
import { PessoaService } from 'src/services/pessoa.service';

@ApiTags('Pessoa')
@Controller('api/pessoa')
export class PessoaController {
      constructor(private readonly pessoaService: PessoaService) {}

      @ApiOperation({
            summary: 'Criar Pessoa',
            description:
                  'Utilize este endpoint para cadastrar uma nova pessoa.',
      })
      @Post()
      @IsPublic()
      // @UseGuards(JwtAuthGuard)
      @HttpCode(HttpStatus.CREATED)
      async create(@Body() payload: CreatePessoaDTO): Promise<Pessoa> {
            return await this.pessoaService.create(payload);
      }

      @ApiOperation({
            summary: 'Buscar Pessoa por ID',
            description:
                  'Utilize este endpoint para buscar uma pessoa pelo ID.',
      })
      @Get(':id')
      @IsPublic()
      //   @UseGuards(JwtAuthGuard)
      async findById(@Param('id') id: string): Promise<Pessoa> {
            return await this.pessoaService.findById(id);
      }

      @ApiOperation({
            summary: 'Listar Pessoas',
            description:
                  'Utilize este endpoint para listar todas as pessoas cadastradas.',
      })
      @Get()
      @IsPublic()
      @ApiQuery({
            name: 'page',
            required: false,
            type: Number,
            description: 'Page number',
      })
      @ApiQuery({
            name: 'limit',
            required: false,
            type: Number,
            description: 'Number of items per page',
      })
      //   @UseGuards(JwtAuthGuard)
      async findAll(@Query() filters?: FiltersPessoaDTO) {
            return this.pessoaService.findAll(filters);
      }

      @ApiOperation({
            summary: 'Atualizar Pessoa',
            description:
                  'Utilize este endpoint para atualizar os dados de uma pessoa.',
      })
      @Patch(':id')
      @IsPublic()
      //   @UseGuards(JwtAuthGuard)
      async update(@Param('id') id: string, @Body() payload: CreatePessoaDTO) {
            await this.pessoaService.update(id, payload);
            return { message: 'Pessoa atualizada com sucesso!' };
      }

      @ApiOperation({
            summary: 'Deletar Pessoa',
            description:
                  'Utilize este endpoint para deletar uma pessoa cadastrada.',
      })
      @Delete(':id')
      @IsPublic()
      //   @UseGuards(JwtAuthGuard)
      async delete(@Param('id') id: string) {
            await this.pessoaService.delete(id);
            return { message: 'Pessoa deletada com sucesso!' };
      }
}
