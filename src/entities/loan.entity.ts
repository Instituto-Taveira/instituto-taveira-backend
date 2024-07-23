import { v4 as uuid } from 'uuid';
import { Payment } from './payment.entity';

export enum EFormatInstalment {
      MONTHLY = 1,
      BIWEEKLY = 2,
      WEEKLY = 3,
}

export class Loan {
      id: string;
      value_loan: number;
      interest_rate: number;
      rest_loan: number;
      format_instalment: EFormatInstalment;
      startDate: Date;
      dueDate: Date;
      payment?: Payment[];
      payment_settled?: boolean;
      clientId?: string;
      createdAt?: Date;
      updatedAt?: Date | null;

      constructor(
            props: Omit<
                  Loan,
                  'startDate' | 'dueDate' | 'createdAt' | 'clientId' | 'id'
            >,
            startDate: Date,
            dueDate: Date,
            id?: string,
      ) {
            Object.assign(this, props);
            this.dueDate = dueDate;
            this.startDate = startDate;
            this.id = id ?? uuid();
      }
}
