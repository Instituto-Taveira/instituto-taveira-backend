import { Inject, Injectable } from '@nestjs/common';
import { UpdatePaymentLoan } from 'src/dto/loan/update-payment.dto';
import { CreatePaymentDto } from 'src/dto/payment/createPayment.dto';
import { Payment } from 'src/entities/payment.entity';
import IPaymentRepository from 'src/repository/payment/payment.repository.contract';
@Injectable()
export class PaymentService {
      constructor(
            @Inject('IPaymentRepository')
            private readonly repository: IPaymentRepository,
      ) {}

      async create(value: number, loanId: string, dueDate: Date) {
            const loan = await this.repository.create(
                  new Payment(
                        {
                              value,
                              loanId,
                              dueDate,
                              settled: false,
                              valuePaid: 0,
                        },
                        loanId,
                  ),
                  loanId,
            );
            return loan;
      }

      async findById(id: string) {
            return this.repository.findById(id);
      }

      async updateInstalment(id: string, payload: UpdatePaymentLoan) {
            return await this.repository.updateInstalment(id, payload);
      }
}
