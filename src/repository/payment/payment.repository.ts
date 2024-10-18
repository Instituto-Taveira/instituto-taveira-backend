import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/prisma.service';
import { Payment } from 'src/entities/payment.entity';
import IPaymentRepository from './payment.repository.contract';
import { UpdatePaymentLoan } from 'src/dto/loan/update-payment.dto';
import { Loan } from 'src/entities/loan.entity';

@Injectable()
export class PaymentRepository implements IPaymentRepository {
      constructor(private readonly repository: PrismaService) {}
      async updateInstalment(
            id: string,
            payload: UpdatePaymentLoan,
      ): Promise<void> {
            await this.repository.payment.update({
                  where: {
                        id,
                  },
                  data: {
                        valuePaid: payload.valuePaid,
                        settled: payload.settled,
                        updatedAt: new Date(),
                  },
            });
      }
      async findById(id: string): Promise<Payment> {
            return await this.repository.payment.findUnique({
                  where: {
                        id,
                  },
                  include: {
                        loan: true,
                  },
            });
      }
      create(data: Payment, loanId: string): Promise<any> {
            return this.repository.payment.create({
                  data: {
                        id: data.id,
                        value: data.value,
                        dueDate: data.dueDate,
                        valuePaid: data.valuePaid,
                        settled: data.settled,
                        loan: {
                              connect: {
                                    id: loanId,
                              },
                        },
                        createdAt: data.createdAt,
                  },
            });
      }
}
