import { Injectable } from '@nestjs/common';
import { Pageable } from '../../config/database/pageable.service';
import { PrismaService } from '../../config/database/prisma.service';
import ILoanRepository from './loan.repository.contract';
import { Loan } from '../../entities/loan.entity';
import { CreateNewDueDto } from 'src/dto/loan/create-new-due.dto';

@Injectable()
export class LoanRepository extends Pageable<Loan> implements ILoanRepository {
      constructor(private readonly repository: PrismaService) {
            super();
      }

      async updateRestLoan(
            id: string,
            rest_loan: number,
            settle: boolean,
            only_pay_interest: boolean,
      ): Promise<Loan> {
            return await this.repository.loan.update({
                  where: {
                        id,
                  },
                  data: {
                        rest_loan,
                        payment_settled: settle,
                        only_pay_interest,
                  },
            });
      }

      findPaymentTrue(
            payment_settled: boolean,
            clientId: string,
      ): Promise<any> {
            return this.repository.loan.findMany({
                  where: {
                        payment_settled: payment_settled,
                        clientId,
                  },
                  include: {
                        client: true,
                        payment: true,
                  },
            });
      }

      findPaymentFalse(): Promise<any> {
            return this.repository.loan.findMany({
                  where: {
                        payment_settled: false,
                  },
                  include: {
                        payment: true,
                  },
            });
      }

      update(id: string): Promise<Loan> {
            return this.repository.loan.update({
                  where: {
                        id,
                  },
                  data: {
                        payment_settled: true,
                        rest_loan: 0,
                  },
            });
      }
      delete(id: string): Promise<Loan> {
            return this.repository.loan.delete({
                  where: {
                        id,
                  },
            });
      }
      findById(id: string): Promise<any> {
            return this.repository.loan.findUnique({
                  where: {
                        id,
                  },
                  include: {
                        payment: true,
                  },
            });
      }
      updateInstalment(id: string, data: CreateNewDueDto): Promise<any> {
            return this.repository.loan.update({
                  where: {
                        id,
                  },
                  data: {
                        value_loan: data.value,
                        rest_loan: data.rest_loan,
                        dueDate: data.dueDate,
                  },
            });
      }

      create(data: Loan, clientId: string): Promise<Loan> {
            return this.repository.loan.create({
                  data: {
                        id: data.id,
                        value_loan: data.value_loan,
                        interest_rate: data.interest_rate,
                        format_instalment: data.format_instalment,
                        approved: data.approved,
                        rest_loan: data.rest_loan,
                        dueDate: data.dueDate,
                        startDate: data.startDate,
                        clientId,
                  },
            });
      }
      async findManyByIds(ids: string[]): Promise<any[]> {
            return await this.repository.loan.findMany({
                  where: {
                        id: {
                              in: ids,
                        },
                  },
                  include: {
                        payment: {
                              include: {
                                    iterestDelay: true,
                              },
                        },
                  },
            });
      }

      async updateApproved(id: string, approved: boolean): Promise<Loan> {
            return await this.repository.loan.update({
                  where: {
                        id,
                  },
                  data: {
                        approved,
                  },
            });
      }
}
