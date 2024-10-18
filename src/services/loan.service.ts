import {
      HttpException,
      HttpStatus,
      Inject,
      Injectable,
      forwardRef,
} from '@nestjs/common';
import { EFormatInstalment, Loan } from 'src/entities/loan.entity';
import ILoanRepository from 'src/repository/loan/loan.repository.contract';
import { CreateLoanDto } from '../dto/loan/create-loan.dto';
import { ClientService } from './client.service';
import * as moment from 'moment';
import { PaymentService } from './payment.service';
import { UpdatePaymentLoan } from 'src/dto/loan/update-payment.dto';
import { GenerateReportLoanDto } from 'src/dto/loan/generate-report-loan.dto';
import { AuthService } from './auth.service';
import { UpdateLoanApproved } from 'src/dto/loan/update-loan-approved.dto';

@Injectable()
export class LoanService {
      constructor(
            @Inject('ILoanRepository')
            private readonly loanRepository: ILoanRepository,
            @Inject(forwardRef(() => ClientService))
            private readonly clientService: ClientService,
            private readonly paymentService: PaymentService,
            private readonly authService: AuthService,
      ) {}

      async create(payload: CreateLoanDto, clientId: string, token: string) {
            const client = await this.clientService.listById(clientId);

            const startDate = new Date(payload.start_date);

            const dueDate = moment(startDate).add(1, 'month').toDate();

            const rest_loan =
                  (payload.value_loan * payload.interest_rate) / 100 +
                  payload.value_loan;

            let approved: boolean = false;
            const tokenDecoded = await this.authService.decodeJWT(token);

            if (tokenDecoded.isAdm == true) approved = true;

            console.log(approved);
            const loan = new Loan(
                  {
                        value_loan: payload.value_loan,
                        format_instalment: payload.format_instalment,
                        interest_rate: payload.interest_rate,
                        approved,
                        rest_loan,
                        only_pay_interest: false,
                        payment_settled: false,
                        updatedAt: new Date(),
                  },
                  startDate,
                  dueDate,
            );

            const installments = this.convertToInstallments(
                  payload.format_instalment,
            );
            const loanCreated = await this.loanRepository.create(
                  loan,
                  client.id,
            );

            switch (payload.format_instalment) {
                  case EFormatInstalment.MONTHLY:
                        await this.generateInstallments(
                              loan,
                              startDate,
                              installments,
                              (date, count) => date.add(count, 'month'),
                        );
                        break;
                  case EFormatInstalment.BIWEEKLY:
                        await this.generateInstallments(
                              loan,
                              startDate,
                              installments,
                              (date, count) => date.add(count * 15, 'days'),
                        );
                        break;
                  case EFormatInstalment.WEEKLY:
                        await this.generateInstallments(
                              loan,
                              startDate,
                              installments,
                              (date, count) => date.add(count, 'week'),
                        );
                        break;
            }

            return loanCreated;
      }

      async findTrue(payment_settled: string, clientId: string) {
            let booleanPayment_settled =
                  payment_settled == 'true' ? true : false;

            await this.clientService.listById(clientId);

            return this.loanRepository.findPaymentTrue(
                  booleanPayment_settled,
                  clientId,
            );
      }

      findFalse() {
            return this.loanRepository.findPaymentFalse();
      }

      async findOne(id: string) {
            const loan = await this.loanRepository.findById(id);

            if (!loan)
                  throw new HttpException(
                        `Não foi encontrado um empréstimo com o id: ${id}`,
                        HttpStatus.NOT_FOUND,
                  );
            return loan;
      }

      async updateLoanSettle(id: string) {
            const loan = await this.findOne(id);
            return await this.loanRepository.update(loan.id);
      }

      async remove(id: string) {
            const loan = await this.findOne(id);
            return await this.loanRepository.delete(loan.id);
      }

      async updateInstalment(id: string, payload: UpdatePaymentLoan) {
            const payment = await this.paymentService.findById(id);

            if (!payment)
                  throw new HttpException(
                        `Não foi encontrado um pagamento com o id: ${id}`,
                        HttpStatus.NOT_FOUND,
                  );
            if (payment.settled)
                  throw new HttpException(
                        `O pagamento com o id: ${id} já foi liquidado`,
                        HttpStatus.BAD_REQUEST,
                  );
            if (payload.valuePaid > payment.value)
                  throw new HttpException(
                        `O valor pago é maior que o valor da parcela`,
                        HttpStatus.BAD_REQUEST,
                  );

            await this.paymentService.updateInstalment(payment.id, payload);
            const loanUpdated = await this.loanRepository.findById(
                  payment.loanId,
            );
            console.log(loanUpdated);

            const isAllPaid = loanUpdated.payment.every(
                  (payment) => payment.settled,
            );

            console.log(isAllPaid);

            const rest_loan = payment.loan.rest_loan - payload.valuePaid;

            const loan = await this.loanRepository.updateRestLoan(
                  payment.loanId,
                  isAllPaid ? 0 : rest_loan,
                  isAllPaid,
                  false,
            );

            return {
                  message: 'Instalment updated',
            };
      }

      async updateLoanApproved(id: string, payload: UpdateLoanApproved) {
            const loan = await this.loanRepository.findById(id);

            if (!loan)
                  throw new HttpException(
                        `Não foi encontrado um empréstimo com o id: ${id}`,
                        HttpStatus.NOT_FOUND,
                  );

            if (loan.approved)
                  throw new HttpException(
                        `O empréstimo com o id: ${id} já foi aprovado`,
                        HttpStatus.BAD_REQUEST,
                  );
            if (payload.approved == true)
                  return await this.loanRepository.updateApproved(
                        loan.id,
                        payload.approved,
                  );

            return await this.loanRepository.delete(loan.id);
      }

      async updatePartialInstalment(
            id: string,
            payload: UpdatePaymentLoan,
            token: string,
      ) {
            const payment = await this.paymentService.findById(id);

            if (!payment)
                  throw new HttpException(
                        `Não foi encontrado um pagamento com o id: ${id}`,
                        HttpStatus.NOT_FOUND,
                  );
            if (payment.settled)
                  throw new HttpException(
                        `O pagamento com o id: ${id} já foi liquidado`,
                        HttpStatus.BAD_REQUEST,
                  );
            if (payload.valuePaid > payment.value)
                  throw new HttpException(
                        `O valor pago é maior que o valor da parcela`,
                        HttpStatus.BAD_REQUEST,
                  );

            await this.paymentService.updateInstalment(payment.id, payload);
            const rest_loan = payment.loan.rest_loan - payload.valuePaid;
            await this.loanRepository.updateRestLoan(
                  payment.loanId,
                  rest_loan,
                  true,
                  true,
            );

            if (payload.valuePaid == payment.value)
                  return {
                        message: 'Instalment updated',
                  };

            const createNewPayment: CreateLoanDto = {
                  value_loan: rest_loan,
                  format_instalment: payment.loan.format_instalment,
                  interest_rate: payment.loan.interest_rate,
                  start_date: payment.dueDate,
            };

            await this.create(createNewPayment, payment.loan.clientId, token);

            return {
                  message: 'Instalment updated',
            };
      }
      private convertToInstallments(format_instalment: EFormatInstalment) {
            switch (format_instalment) {
                  case EFormatInstalment.MONTHLY:
                        return 1;
                  case EFormatInstalment.BIWEEKLY:
                        return 2;
                  case EFormatInstalment.WEEKLY:
                        return 4;
            }
      }

      async generateInstallments(
            loan: any,
            startDate: Date,
            installments: number,
            incrementFn: (date: moment.Moment, count: number) => moment.Moment,
      ) {
            for (let i = 0; i < installments; i++) {
                  const value = loan.rest_loan / installments;
                  const dueDate = incrementFn(
                        moment(startDate),
                        i + 1,
                  ).toDate();
                  await this.paymentService.create(value, loan.id, dueDate);
            }
      }
}
