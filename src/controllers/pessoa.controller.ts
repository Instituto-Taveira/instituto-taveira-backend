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
      UseFilters,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DomainExceptionFilter } from 'src/common/filters/domain-exception.filter';
import { IsPublic } from 'src/decorators/public.decorator';
import { CreatePessoaDTO } from 'src/dto/pessoa/createPessoa.dto';
import { FiltersPessoaDTO } from 'src/dto/pessoa/filterPessoa.dto';
import { Pessoa } from 'src/entities/pessoa.entity';
import { PessoaService } from 'src/services/pessoa.service';

@ApiTags('Pessoa')
@Controller('api/pessoa')
export class PessoaController {
      constructor(private readonly pessoaService: PessoaService) { }

      @Get('birthdays')
      @IsPublic()
      @UseFilters(new DomainExceptionFilter())
      async findBirthDays(): Promise<{ pessoas: any[]; dependentes: any[] }> {
            return this.pessoaService.findBirthDays();
      }

      @ApiOperation({
            summary: 'Criar Pessoa',
            description:
                  'Utilize este endpoint para cadastrar uma nova pessoa.',
      })
      @Post()
      @IsPublic()
      // @UseGuards(JwtAuthGuard)
      @UseFilters(new DomainExceptionFilter())
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
      async findById(@Param('id') id: number): Promise<Pessoa> {
            return await this.pessoaService.findById(Number(id));
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
      async update(@Param('id') id: number, @Body() payload: CreatePessoaDTO) {
            await this.pessoaService.update(Number(id), payload);
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
      async delete(@Param('id') id: number) {
            await this.pessoaService.delete(Number(id));
            return { message: 'Pessoa deletada com sucesso!' };
      }

      @IsPublic()
      @ApiOperation({
            summary: 'Criar Várias Pessoas',
            description:
                  'Utilize este endpoint para cadastrar várias pessoas de uma vez.',
      })
      @HttpCode(HttpStatus.CREATED)
      @Post('bulk')
      bulkCreate(@Body() users: CreatePessoaDTO[]) {
            return this.pessoaService.createBulk(users);
      }

}
