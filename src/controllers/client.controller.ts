import {
      Controller,
      Get,
      Post,
      Body,
      Param,
      Delete,
      Put,
      Query,
      Headers,
      UseGuards,
} from '@nestjs/common';
import { ClientService } from '../services/client.service';
import { CreateClientDto } from '../dto/client/createClient.dto';
import { UpdateClientDto } from '../dto/client/updateClient.dto';
import { FiltersClientDTO } from '../dto/client/filterClient.dto';
import { Page, PageResponse } from 'src/config/database/page.model';
import { MappedClientDTO } from 'src/dto/client/mappedClient.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/config/authentication/guards/jwtAuth.guard';
import { GenerateReportLoanDto } from 'src/dto/loan/generate-report-loan.dto';
import { GenerateReportLoanClientDto } from 'src/dto/loan/generate-report-loan-client.dto';
import { GenerateReportInstalmentClosedDto } from 'src/dto/loan/generate-report-instalment-closed.dto';

@ApiTags('Client')
@ApiBearerAuth()
@Controller('api/client')
export class ClientController {
      constructor(private readonly clientService: ClientService) {}

      @ApiOperation({
            summary: 'Criar Cliente',
            description: 'Utilize este endpoint para criar um novo cliente.',
      })
      @Post()
      @UseGuards(JwtAuthGuard)
      create(
            @Body() createClientDto: CreateClientDto,
            @Headers('authorization') token: string,
      ) {
            return this.clientService.create(createClientDto, token);
      }

      @ApiOperation({
            summary: 'Listar Clientes com pagamentos pendentes',
            description:
                  'Utilize este endpoint para listar todos os clientes com pagamentos pendentes.',
      })
      @Get('/notPayment')
      @UseGuards(JwtAuthGuard)
      listAllFalse(
            @Query() page: Page,
            @Query() filters: FiltersClientDTO,
      ): Promise<PageResponse<MappedClientDTO>> {
            return this.clientService.listAllFalse(page, filters);
      }

      @ApiOperation({
            summary: 'Listar Clientes',
            description: 'Utilize este endpoint para listar todos os clientes.',
      })
      @Get('')
      @UseGuards(JwtAuthGuard)
      async listAll(
            @Query() page: Page,
            @Query() filters: FiltersClientDTO,
            @Headers('authorization') token: string,
      ): Promise<PageResponse<MappedClientDTO>> {
            return await this.clientService.listAll(page, token, filters);
      }

      @ApiOperation({
            summary: 'Listar Clientes com pagamentos confirmados',
            description:
                  'Utilize este endpoint para listar todos os clientes com pagamentos confirmados.',
      })
      @Get('/paymentConfirmed')
      @UseGuards(JwtAuthGuard)
      listAllTrue(
            @Query() page: Page,
            @Query() filters: FiltersClientDTO,
      ): Promise<PageResponse<MappedClientDTO>> {
            return this.clientService.listAllTrue(page, filters);
      }

      @ApiOperation({
            summary: 'Buscar Cliente',
            description: 'Utilize este endpoint para buscar um cliente por ID.',
      })
      @UseGuards(JwtAuthGuard)
      @Get(':id')
      async listById(@Param('id') id: string) {
            return await this.clientService.listById(id);
      }

      @ApiOperation({
            summary: 'Atualizar Cliente',
            description: 'Utilize este endpoint para atualizar um cliente.',
      })
      @UseGuards(JwtAuthGuard)
      @Put(':id')
      async update(
            @Param('id') id: string,
            @Body() updateclientDto: UpdateClientDto,
      ) {
            return await this.clientService.update(id, updateclientDto);
      }

      @ApiOperation({
            summary: 'Deletar Cliente',
            description: 'Utilize este endpoint para deletar um cliente.',
      })
      @UseGuards(JwtAuthGuard)
      @Delete(':id')
      remove(@Param('id') id: string) {
            return this.clientService.delete(id);
      }

      @ApiOperation({
            summary: 'Gerar relatório de Empréstimos',
            description:
                  'Utilize este endpoint para gerar um relatório de empréstimos.',
      })
      @UseGuards(JwtAuthGuard)
      @Post('/report/all')
      async report(@Body() payload: GenerateReportLoanDto) {
            return await this.clientService.report(payload);
      }

      @ApiOperation({
            summary: 'Gerar relatório de Empréstimos dos clientes',
            description:
                  'Utilize este endpoint para gerar um relatório de empréstimos de um cliente.',
      })
      @UseGuards(JwtAuthGuard)
      @Post('/report/client')
      async reportClient(@Body() payload: GenerateReportLoanClientDto) {
            return await this.clientService.reportClient(payload);
      }

      @ApiOperation({
            summary: 'Gerar relatório parcelas fechadas no dia',
            description:
                  'Utilize este endpoint para gerar um relatório de parcelas fechadas no dia',
      })
      @UseGuards(JwtAuthGuard)
      @Post('/report/closed')
      async reportClosed(@Body() payload: GenerateReportInstalmentClosedDto) {
            return await this.clientService.reportClosed(payload);
      }

      @ApiOperation({
            summary: 'Listar nomes dos clientes',
            description:
                  'Utilize este endpoint para listar os nomes dos clientes.',
      })
      @UseGuards(JwtAuthGuard)
      @Get('/names/all')
      listClientsName() {
            return this.clientService.listAllNames();
      }
}
