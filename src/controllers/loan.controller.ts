import {
      Controller,
      Get,
      Post,
      Body,
      Param,
      Delete,
      Put,
      Headers,
      UseGuards,
} from '@nestjs/common';
import { LoanService } from '../services/loan.service';
import { CreateLoanDto } from '../dto/loan/create-loan.dto';
import { UpdateLoanDto } from '../dto/loan/update-loan.dto';
import { UpdatePaymentLoan } from 'src/dto/loan/update-payment.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GenerateReportLoanDto } from 'src/dto/loan/generate-report-loan.dto';
import { JwtAuthGuard } from 'src/config/authentication/guards/jwtAuth.guard';
import { UpdateLoanApproved } from 'src/dto/loan/update-loan-approved.dto';

@ApiTags('Loan')
@ApiBearerAuth()
@Controller('api/loan')
export class LoanController {
      constructor(private readonly loanService: LoanService) {}

      @ApiOperation({
            summary: 'Criar Empréstimo',
            description: 'Utilize este endpoint para criar um novo empréstimo.',
      })
      @UseGuards(JwtAuthGuard)
      @Post('/:clientId')
      create(
            @Param('clientId') clientId: string,
            @Body() payload: CreateLoanDto,
            @Headers('Authorization') token: string,
      ) {
            return this.loanService.create(payload, clientId, token);
      }

      @ApiOperation({
            summary: 'Listar Empréstimos',
            description:
                  'Utilize este endpoint para listar todos os empréstimos.',
      })
      @UseGuards(JwtAuthGuard)
      @Get('/false')
      findFalse() {
            return this.loanService.findFalse();
      }

      @ApiOperation({
            summary: 'Listar Empréstimos',
            description:
                  'Utilize este endpoint para listar todos os empréstimos.',
      })
      @UseGuards(JwtAuthGuard)
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
      @UseGuards(JwtAuthGuard)
      @Get(':id')
      findOne(@Param('id') id: string) {
            return this.loanService.findOne(id);
      }

      @ApiOperation({
            summary: 'Atualizar Empréstimo',
            description: 'Utilize este endpoint para atualizar um empréstimo.',
      })
      @UseGuards(JwtAuthGuard)
      @Put(':id')
      update(@Param('id') id: string) {
            return this.loanService.updateLoanSettle(id);
      }

      @ApiOperation({
            summary: 'Atualizar Parcela',
            description: 'Utilize este endpoint para atualizar uma parcela.',
      })
      @UseGuards(JwtAuthGuard)
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
            summary: 'Aprovar ou Reprovar Empréstimo',
            description:
                  'Utilize este endpoint para aprovar ou reprovar um empréstimo.',
      })
      @UseGuards(JwtAuthGuard)
      @Put('/approved/:id')
      async updateApproved(
            @Param('id') id: string,
            @Body() payload: UpdateLoanApproved,
      ) {
            await this.loanService.updateLoanApproved(id, payload);
            return {
                  message: 'Empréstimo atualizado',
            };
      }

      @ApiOperation({
            summary: 'Atualizar Parcela para pagamento Parcial',
            description:
                  'Utilize este endpoint para atualizar uma parcela para pagamento parcial.',
      })
      @UseGuards(JwtAuthGuard)
      @Put('/instalment-partial/:id')
      async updatePartialInstalment(
            @Param('id') id: string,
            @Body() payload: UpdatePaymentLoan,
            @Headers('Authorization') token: string,
      ) {
            await this.loanService.updatePartialInstalment(id, payload, token);
            return {
                  message: 'Pagamento parcial atualizado',
            };
      }

      @ApiOperation({
            summary: 'Deletar Empréstimo',
            description: 'Utilize este endpoint para deletar um empréstimo.',
      })
      @UseGuards(JwtAuthGuard)
      @Delete(':id')
      remove(@Param('id') id: string) {
            return this.loanService.remove(id);
      }
}
