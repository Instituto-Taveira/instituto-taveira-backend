import {
      Controller,
      Get,
      Post,
      Body,
      Param,
      Delete,
      Put,
} from '@nestjs/common';
import { LoanService } from '../services/loan.service';
import { CreateLoanDto } from '../dto/loan/create-loan.dto';
import { UpdateLoanDto } from '../dto/loan/update-loan.dto';
import { UpdatePaymentLoan } from 'src/dto/loan/update-payment.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GenerateReportLoanDto } from 'src/dto/loan/generate-report-loan.dto';

@ApiTags('Loan')
@ApiBearerAuth()
@Controller('api/loan')
export class LoanController {
      constructor(private readonly loanService: LoanService) {}

      @ApiOperation({
            summary: 'Criar Empréstimo',
            description: 'Utilize este endpoint para criar um novo empréstimo.',
      })
      @Post('/:clientId')
      create(
            @Param('clientId') clientId: string,
            @Body() payload: CreateLoanDto,
      ) {
            return this.loanService.create(payload, clientId);
      }

      @ApiOperation({
            summary: 'Listar Empréstimos',
            description:
                  'Utilize este endpoint para listar todos os empréstimos.',
      })
      @Get('/false')
      findFalse() {
            return this.loanService.findFalse();
      }

      @ApiOperation({
            summary: 'Listar Empréstimos',
            description:
                  'Utilize este endpoint para listar todos os empréstimos.',
      })
      @Get(':payment_settled/:clientId')
      findTrue(
            @Param('payment_settled') payment_settled: string,
            @Param('clientId') clientId: string,
      ) {
            return this.loanService.findTrue(payment_settled, clientId);
      }

      @ApiOperation({
            summary: 'Buscar Empréstimo',
            description:
                  'Utilize este endpoint para buscar um empréstimo por ID.',
      })
      @Get(':id')
      findOne(@Param('id') id: string) {
            return this.loanService.findOne(id);
      }

      @ApiOperation({
            summary: 'Atualizar Empréstimo',
            description: 'Utilize este endpoint para atualizar um empréstimo.',
      })
      @Put(':id')
      update(@Param('id') id: string) {
            return this.loanService.updateLoanSettle(id);
      }

      @ApiOperation({
            summary: 'Atualizar Parcela',
            description: 'Utilize este endpoint para atualizar uma parcela.',
      })
      @Put('/instalment/:id')
      async updateInstalment(
            @Param('id') id: string,
            @Body() payload: UpdatePaymentLoan,
      ) {
            await this.loanService.updateInstalment(id, payload);
            return {
                  message: 'Instalment updated',
            };
      }

      @ApiOperation({
            summary: 'Atualizar Parcela para pagamento Parcial',
            description:
                  'Utilize este endpoint para atualizar uma parcela para pagamento parcial.',
      })
      @Put('/instalment-partial/:id')
      async updatePartialInstalment(
            @Param('id') id: string,
            @Body() payload: UpdatePaymentLoan,
      ) {
            await this.loanService.updatePartialInstalment(id, payload);
            return {
                  message: 'Pagamento parcial atualizado',
            };
      }

      @ApiOperation({
            summary: 'Deletar Empréstimo',
            description: 'Utilize este endpoint para deletar um empréstimo.',
      })
      @Delete(':id')
      remove(@Param('id') id: string) {
            return this.loanService.remove(id);
      }
}
