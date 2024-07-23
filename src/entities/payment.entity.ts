import { IterestDelay } from './iterestDelay.entity';
import { Loan } from './loan.entity';
import { v4 as uuid } from 'uuid';

export class Payment {
      id: string;
      value: number;
      valuePaid: number;
      settled: boolean;
      iterestDelay?: IterestDelay;
      loan: Loan;
      loanId: string;
      dueDate: Date;
      createdAt?: Date;
      updatedAt?: Date | null;

      constructor(
            props: Omit<Payment, 'loan' | 'id' | 'createdAt'>,
            loanId: string,
            id?: string,
      ) {
            Object.assign(this, props);
            this.loanId = loanId;
            this.id = id ?? uuid();
      }
}
